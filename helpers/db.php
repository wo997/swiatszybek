<?php

function query($sql, $params = []) // returns nothing; update delete insert purpose 
{
  return fetchArray($sql, $params, false);
}

function fetchArray($sql, $params = [], $give_response = true)
{
  global $con;

  try {
    $stmt = $con->prepare($sql);
    $paramCount = count($params);
    if ($paramCount) $stmt->bind_param(str_repeat("s", $paramCount), ...$params);

    if (!$give_response) {
      $res = $stmt->execute();
    } else {
      $stmt->execute();
      $res = $stmt->get_result()->fetch_all(1);
    }
    $stmt->close();
  } catch (Exception $e) {
    echo "SQL EXCEPTION:<br>$sql<br>[" . join(",", $params) . "]<br>";
    die($e);
  }
  return $res;
}


function fetchRow($sql, $params = [])
{
  $res = fetchArray($sql, $params);
  return isset($res[0]) ? $res[0] : [];
}

function fetchValue($sql, $params = [])
{
  $res = fetchRow($sql, $params);
  return isset(array_keys($res)[0]) ? $res[array_keys($res)[0]] : null;
}

function fetchColumn($sql, $params = [])
{
  $res = fetchArray($sql, $params);
  if (!isset($res[0]) || !isset(array_keys($res[0])[0])) return [];
  return array_column($res, array_keys($res[0])[0]);
}



function getLastInsertedId()
{
  global $con;
  return mysqli_insert_id($con);
}

/**
 * removes everything except  (a-z) (A-Z) (0-9) "_" " "
 *
 * @param  string $x
 * @return string
 */
function clean($x)
{
  return preg_replace("/[^a-zA-Z0-9_ ]/", "", $x);
}

function escapeSQL($var)
{
  global $con;
  return mysqli_real_escape_string($con, $var);
}

/**
 * checks whether table exists in db
 *
 * @param  string $name
 * @return bool
 */
function tableExists($name)
{
  return fetchValue("show tables like '" . clean($name) . "'");
}

/**
 * checks whether column exists in db
 *
 * @param  string $table
 * @param  string $name
 * @return bool
 */
function columnExists($table, $name)
{
  if (!tableExists($table)) return null;
  if (fetchValue("SHOW COLUMNS FROM " . clean($table) . " LIKE '" . clean($name) . "'")) return true;
  return false;
}

/**
 *
 * @param  string $table
 * @param  array $names
 * @return void
 */
function dropColumns($table, $names)
{
  foreach ($names as $name) {
    if (columnExists($table, $name)) {
      query("ALTER TABLE " . clean($table) . " DROP COLUMN " . clean($name));

      echo "🗑️ Column '$name' dropped from $table! <br>";
    }
  }
}

/**
 *
 * @param  string $table
 * @param  array $names
 * @return void
 */
function dropTable($table)
{
  if (tableExists($table)) {
    query("DROP TABLE " . clean($table));
    echo "🗑️ Table '$table' dropped! <br>";
  }
}

function getColumnDefinition($column)
{
  $definition = clean($column["name"])
    . " " . $column["type"]
    . ($column["null"] ? "" : " NOT NULL");

  if (isset($column["default"])) {
    $definition .= " DEFAULT " . $column["default"];
  } else if (isset($column["default_string"])) {
    $definition .= " DEFAULT '" . escapeSQL($column["default_string"]) . "'";
  }
  return $definition;
}

/**
 * Create table in DB with specified columns allowing to modify the table if necessary
 * parameter details in function addColumns($table, $columns)
 * @param  string $table
 * @param array<array> $columns
 * @return void
 */
function createTable($table, $columns)
{
  if (tableExists($table)) {
    addColumns($table, $columns); // possibly modify columns at this point, totally flexible
    return;
  }

  $sql = "CREATE TABLE $table (";

  foreach ($columns as $column) {
    $column["null"] = nonull($column, "null", false);
    $column["type"] = strtoupper($column["type"]);

    $definition = getColumnDefinition($column);

    $sql .= $definition . ",";
  }

  $sql = rtrim($sql, ",");
  $sql .= ")";

  query($sql);

  echo "➕ Table '$table' created<br>";
}

/**
 * Add columns to the database or modify existing ones if they differ
 * Provide columns defined by
 * - name *required*
 * - type (f.e int) *required*
 * - previous_name (rename old field)
 * - null (boolean, default false - no nulls allowed)
 * - default / default_string (f.e 0)
 *
 * @param  string $table
 * @param array<array> $columns
 * @return void
 */
function addColumns($table, $columns)
{
  foreach ($columns as $column) {
    $column["null"] = nonull($column, "null", false);
    $column["type"] = strtoupper($column["type"]);

    $columnExists = columnExists($table, $column["name"]);

    $isNew = false;
    $modify = false;

    if (isset($column["previous_name"]) && $column["previous_name"] !== $column["name"]) {
      $differentNameColumnExists = columnExists($table, $column["previous_name"]);

      if ($differentNameColumnExists && $columnExists) {
        echo "⚠️ Migration error, tried to change column from '" . $column["previous_name"] . "' to '" . $column["name"] . "' but '" . $column["name"] . "' already exists in '" . $table . "'!";
        continue;
      }

      if ($differentNameColumnExists) {
        $columnExists = true;
        $modify = true;
      } else {
        $column["previous_name"] = $column["name"];
      }
    }

    $column["previous_name"] = nonull($column, "previous_name", $column["name"]);

    if (!$modify && !$columnExists) {
      $isNew = true;
    } else { // compare new column with already existing one
      foreach (fetchArray("DESC " . clean($table)) as $existing_column) {
        // early escape if names are different
        if ($existing_column["Field"] != $column["previous_name"]) {
          continue;
        }

        // compare nulls
        if ($existing_column["Null"] != ($column["null"] ? "YES" : "NO")) {
          $modify = true;
          break;
        }

        // compare defaults
        if (isset($column["default"]) && $existing_column["Default"] !== $column["default"]) {
          $modify = true;
          break;
        }
        if (isset($column["default_string"]) && $existing_column["Default"] !== $column["default_string"]) {
          $modify = true;
          break;
        }
        if (!isset($column["default_string"]) && !isset($column["default"]) && $existing_column["Default"] !== null) {
          $modify = true;
          break;
        }

        // compare types literally only when new type contains any digit meaning that digits in general are limited, kind of hacky
        $existing_column["Type"] = strtoupper($existing_column["Type"]);

        if (preg_replace("/\D/", "", $column["type"]) === "") { // no digits
          if (preg_replace("/[^A-Z]/", "", $existing_column["Type"]) != preg_replace("/[^A-Z]/", "", $column["type"])) { // no digit comparision
            $modify = true;
            break;
          }
        } else {
          if ($existing_column["Type"] != $column["type"]) { // literal comparision
            $modify = true;
            break;
          }
        }
      }
    }

    $definition = getColumnDefinition($column);

    if ($modify) {
      query("ALTER TABLE " . clean($table) . " CHANGE " . $column["previous_name"] . " " . $definition);
      echo "🔄 Column '" . $column["name"] . "' modified in $table<br>";
    } else if ($isNew) {
      query("ALTER TABLE " . clean($table) . " ADD " . $definition);
      echo "➕ Column '" . $column["name"] . "' added into $table<br>";
    }
  }
}
