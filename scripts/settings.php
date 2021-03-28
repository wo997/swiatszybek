<?php

/**
 * Use this function to fetch all data quickly from preloaded JSON
 * $path: array
 */
function getSetting($path, $default = "")
{
    return def(SETTINGS, $path, $default);
}

$settings = json_decode(@file_get_contents(BUILDS_PATH . "settings.json"), true);
if (!$settings) {
    $settings = [];
}
define("SETTINGS", $settings);
