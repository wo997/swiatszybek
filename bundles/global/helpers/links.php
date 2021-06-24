<?php

// also global.js
function replacePolishLetters($string)
{
    $pl = ['ę', 'Ę', 'ó', 'Ó', 'ą', 'Ą', 'ś', 'Ś', 'ł', 'Ł', 'ż', 'Ż', 'ź', 'Ź', 'ć', 'Ć', 'ń', 'Ń'];
    $en = ['e', 'E', 'o', 'O', 'a', 'A', 's', 'S', 'l', 'L', 'z', 'Z', 'z', 'Z', 'c', 'C', 'n', 'N'];
    return str_replace($pl, $en, $string);
}

// also global.js
function escapeUrl($string)
{
    return
        preg_replace("/-+/", "-", preg_replace("/[^(a-zA-Z0-9-)]/", "", str_replace(
            [',', ' '],
            ['-', '-'],
            replacePolishLetters(
                trim($string)
            )
        )));
}
