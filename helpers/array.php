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
