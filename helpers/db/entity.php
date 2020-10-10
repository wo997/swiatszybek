<?php

/**
 * Updates entity
 * - $data: associative array
 * - $table: string 
 * - $primary: string 
 * - $id: int
 * - ?$log: bool
 * - return: void
 *
 */
function updateEntity($data, $table, $primary, $id, $log = false)
{
    $query = "UPDATE " . clean($table) . " SET ";
    foreach (array_keys($data) as $field) {
        $query .= clean($field) . "=?,";
    }
    $query = rtrim($query, ",");
    $query .= " WHERE " . clean($primary) . "=" . intval($id);
    query($query, array_values($data));
}

/**
 * **USE getEntityId INSTEAD**
 * - Creates entity and returns its id
 * - $table: string
 * - return: int
 *
 */
function addEntity($table, $options = [])
{
    // TODO logging
    // $log = false, $primary = null

    $data = nonull($options, "data", []);

    $keys_query = "";
    foreach (array_keys($data) as $field) {
        $keys_query .= clean($field) . ",";
    }
    $keys_query = rtrim($keys_query, ",");
    $values_query = rtrim(str_repeat("?,", count($data)), ",");

    query("INSERT INTO " . clean($table) . "($keys_query) VALUES($values_query)", array_values($data));
    $entity_id = getLastInsertedId();
    return $entity_id;
}

/**
 * Creates entity for id = -1 and returns id 
 * - $table: string 
 * - $id: int (-1 for new instances)
 * - return: int
 *
 */
function getEntityId($table, $id, $options = [])
{
    if ($id == "-1") {
        return addEntity($table, $options);
    } else {
        return intval($id);
    }
}

function removeEntity($table, $primary, $id)
{
    query("DELETE FROM " . clean($table) . " WHERE " . clean($primary) . "=" . intval($id));
}
