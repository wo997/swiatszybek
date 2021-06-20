<?php //hook[helper]

use Imper86\PhpInpostApi\InpostApi;

function getInpostApi()
{
    $inpost_settings = getSetting(["general", "carriers", "inpost"], []);

    $token = def($inpost_settings, "token", "");
    $isSandbox = def($inpost_settings, "isSandbox", "");

    $api = new InpostApi($token, $isSandbox);

    return $api;
}
