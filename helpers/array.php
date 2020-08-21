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
    foreach ($array as $selected_attribute) {
        $selection_id = $selected_attribute[$key];
        unset($selected_attribute[$key]);
        $output[$selection_id] = $selected_attribute;
    }
    return $output;
}
