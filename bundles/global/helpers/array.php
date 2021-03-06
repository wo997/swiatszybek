<?php

function def($arr, $key, $default = "")
{
    if (is_array($key)) {
        $arr_sub = &$arr;
        foreach ($key as $path_part) {
            if (isset($arr_sub[$path_part])) {
                $arr_sub = &$arr_sub[$path_part];
            } else {
                return $default;
            }
        }
        return $arr_sub;
    }

    return isset($arr[$key]) ? $arr[$key] : $default;
}


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
        if (!isset($array[$key])) {
            continue;
        }
        $res[$key] = $array[$key];
        // TODO: add isset($array[$key]) and if doesn't exist log it - nahhhhh
    }
    return $res;
}

function getArrayWithoutKeys($array, $keys)
{
    foreach ($keys as $key) {
        unset($array[$key]);
    }
    return $array;
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

function flatMapArray($array, $key)
{
    $res = [];
    foreach ($array as $row) {
        $res[] = $row[$key];
    }
    return $res;
}

// never used
function jsonIntArray($array)
{
    return "[" . join(",", $array) . "]";
}

function filterArrayByKey($array, $key, $value, $invert = false)
{
    if (is_array($value)) {
        if ($invert) {
            return array_filter($array, function ($row) use ($value, $key) {
                return !in_array($value, $row[$key]);
            });
        } else {
            return array_filter($array, function ($row) use ($value, $key) {
                return in_array($value, $row[$key]);
            });
        }
    } else {
        if ($invert) {
            return array_filter($array, function ($row) use ($value, $key) {
                return $row[$key] != $value;
            });
        } else {
            return array_filter($array, function ($row) use ($value, $key) {
                return $row[$key] == $value;
            });
        }
    }
}

/**
 * arraySingle
 *
 * @param  array $array
 * @param  function $callback
 * @return void
 */
function arrayFind($array, $callback, $default = null)
{
    foreach ($array as $item) {
        if ($callback($item)) {
            return $item;
        }
    }
    return $default;
}
