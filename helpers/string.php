<?php

function oneline($str)
{
    return str_replace("\n", " ", htmlspecialchars($str));
}

function str_replace_first($search, $replace, $subject)
{
    $search = '/' . preg_quote($search, '/') . '/';
    return preg_replace($search, $replace, $subject, 1);
}
