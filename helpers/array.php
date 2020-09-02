<?php

/**
 * Change regular array to associative by specified key
 *
 * @param  mixed $array
 * @param  mixed $key
 * @return void
 */
function getAssociativeArray($array, $key)
{
    $output = [];
    foreach ($array as $row) {
        $key_value = $row[$key];
        unset($row[$key]);
        $output[$key_value] = $row;
    }
    return $output;
}

function filterArrayKeys($array, $keys)
{
    $res = [];
    foreach ($keys as $key) {
        $res[$key] = $array[$key];
    }
    return $res;
}

// also array.js 
function getRowById($array, $id, $id_name = "id")
{
    foreach ($array as $row) {
        if ($row[$id_name] == $id) {
            return $row;
        }
    }
    return null;
}
