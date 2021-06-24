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
