<?php

function oneline($str)
{
    return str_replace("\n", " ", htmlspecialchars($str));
}

function strReplaceFirst($search, $replace, $subject)
{
    $search = '/' . preg_quote($search, '/') . '/';
    return preg_replace($search, $replace, $subject, 1);
}

function randomString($length = 10)
{
    $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

function startsWith($haystack, $needle)
{
    $length = strlen($needle);
    return substr($haystack, 0, $length) === $needle;
}

function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    if (!$length) {
        return true;
    }
    return substr($haystack, -$length) === $needle;
}

/**
 * removes everything except  (a-z) (A-Z) (0-9) "_" " " "," "."
 *
 * @param  string $x
 * @return string
 */
function clean($x)
{
    // TODO: try this for xml escaping maybe?
    //$str = htmlentities($str,ENT_QUOTES,'UTF-8');
    return preg_replace("/[^\w ,.]/", "", $x);
}
