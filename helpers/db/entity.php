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
    foreach ($data as $field => $value) {
        $query .= clean($field) . " = ?, ";
    }
    $query = rtrim($query, ", ");
    $query .= " WHERE " . clean($primary) . "=" . intval($id);
    query($query, array_values($data));
}

/**
 * **USE getEntityId INSTEAD**
 * - Creates entity and returns its id
 * - $table: string 
 * - ?$log: bool
 * - ?$primary: string
 * - return: int
 *
 */
function addEntity($table, $log = false, $primary = null)
{
    query("INSERT INTO " . clean($table) . " () VALUES ()");
    $entity_id = getLastInsertedId();
    return $entity_id;
}

/**
 * Creates entity for id = -1 and returns id 
 * - $table: string 
 * - $id: int (-1 for new instances)
 * - ?$log: bool
 * - ?$primary: string
 * - return: int
 *
 */
function getEntityId($table, $id, $log = false, $primary = null)
{
    if ($id == "-1") {
        return addEntity($table);
    } else {
        return intval($id);
    }
}

function removeEntity($table, $primary, $id)
{
    query("DELETE FROM " . clean($table) . " WHERE " . clean($primary) . "=" . intval($id));
}
