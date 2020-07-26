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

      echo "column $name dropped from $table! <br>";
    }
  }
}

/**
 * addColumns
 *
 * @param  string $table
 * @param array<array> $columns
 * @return void
 */
function addColumns($table, $columns)
{
  foreach ($columns as $column) {
    if (!columnExists($table, $column["name"])) {
      query("ALTER TABLE " . clean($table) . " ADD " . clean($column["name"]) . " " . $column["definition"]);

      echo "column " . $column["name"] . " added into $table! <br>";
    }
  }
}
