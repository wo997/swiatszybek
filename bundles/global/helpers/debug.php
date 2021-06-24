<?php

function debug(...$var)
{
    debug_print_backtrace();
    echo "<br><br>\n\n";
    var_dump($var);
    die;
}
