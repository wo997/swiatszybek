<?php

function nonull($arr, $key, $default = "")
{
    return isset($arr[$key]) ? $arr[$key] : $default;
}
