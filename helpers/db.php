<?php

function query($sql, $params = []) // returns nothing; update delete insert purpose 
{
  return fetchArray($sql, $params, false);
}

function fetchArray($sql, $params = [], $give_response = true)
{
  global $con;
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
  return fetchValue("SHOW COLUMNS FROM " . clean($table) . " LIKE '" . clean($name) . "'");
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

      echo "🗑️ Column $name dropped from $table! <br>";
    }
  }
}

/**
 * Add columns to the database or modify existing ones if they differ
 * Provide columns defined by
 * - name *required*
 * - type (f.e int) *required*
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

    $add = false;
    $modify = false;

    $columnExists = columnExists($table, $column["name"]);

    if (!$columnExists) {
      $add = true;
    } else {
      foreach (fetchArray("DESC " . clean($table)) as $existing_column) {
        // early escape if names are different
        if ($existing_column["Field"] != $column["name"]) {
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

    $definition = clean($column["name"])
      . " " . $column["type"]
      . ($column["null"] ? "" : " NOT NULL");

    if (isset($column["default"])) {
      $definition .= " DEFAULT " . $column["default"];
    } else if (isset($column["default_string"])) {
      $definition .= " DEFAULT '" . escapeSQL($column["default_string"]) . "'";
    }

    if ($modify) {
      query("ALTER TABLE " . clean($table) . " MODIFY COLUMN " . $definition);
      echo "🔄 Column " . $column["name"] . " modified in $table<br>";
    } else if ($add) {
      query("ALTER TABLE " . clean($table) . " ADD COLUMN " . $definition);
      echo "➕ Column " . $column["name"] . " added into $table<br>";
    }
  }
}
