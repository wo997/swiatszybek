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
    DB::execute($query, array_values($data));
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

    $data = def($options, "data", []);

    $keys_query = "";
    foreach (array_keys($data) as $field) {
        $keys_query .= clean($field) . ",";
    }
    $keys_query = rtrim($keys_query, ",");
    $values_query = rtrim(str_repeat("?,", count($data)), ",");

    DB::execute("INSERT INTO " . clean($table) . "($keys_query) VALUES($values_query)", array_values($data));
    $entity_id = DB::lastInsertedId();
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
    DB::execute("DELETE FROM " . clean($table) . " WHERE " . clean($primary) . "=" . intval($id));
}


/* NEW FAKE ORM BELOW */

/* different name cause it's already used */
/* these are pretty much setters but we might want to have getters as well, simple event listeners will do the job */
function updateEnt($entity_name, $entity_id, $data)
{
    $entity_name = clean($entity_name);
    $primary = $entity_name . "_id"; // hardcoded but could come from _definition.json as well


    //$current_data

    // that should be kinda optional, tbh I think that if there are some dependencies the event should tell us what to fetch, that would make it crazy fast
    $current_data = DB::fetchRow("SELECT * FROM $entity_name WHERE $primary = $entity_id");

    $before_res = triggerEvent($entity_name . "__before", ["current_data" => $current_data, "data" => $data, "entity_id" => $entity_id]);

    $append_set_query_arr = [];
    $errors = [];
    foreach ($before_res as $res) {
        $append_data = def($res, "append_data", []);
        foreach ($append_data as $field => $value) {
            $data[$field] = $value;
        }
        $append_set_query_arr = array_merge($append_set_query_arr, def($res, "append_set_query", []));
        $errors = array_merge($errors, def($res, "errors", []));
    }

    if (isset($errors[0])) {
        // TODO: feel free to log it baby, devs would love u
        var_dump($errors);
        return $errors;
    }

    // run the actual update query
    $query = "UPDATE $entity_name SET ";
    foreach (array_keys($data) as $field) {
        $query .= clean($field) . "=?,";
    }
    if (isset($append_set_query_arr[0])) {
        $query .= join(",", $append_set_query_arr) . ",";
    }
    $query = rtrim($query, ",");
    $query .= " WHERE " . clean($primary) . "=" . intval($entity_id);

    DB::execute($query, array_values($data));

    // TODO: are you sure we would even need $current_data?
    triggerEvent($entity_name . "__after", ["current_data" => $current_data, "data" => $data, "entity_id" => $entity_id]);
    //var_Dump();

    //$entity_name

    // empty array means success, kinda counterintuitive to return errors but it is the way it is man;
    return [];
}

function updateManyEntities($entity_name, $entity_ids, $data)
{
    // performance issues are going to occour
    foreach ($entity_ids as $entity_id) {
        updateEnt($entity_name, $entity_id, $data);
    }
}
