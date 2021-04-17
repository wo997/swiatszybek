<?php

/**
 * getSetting
 *
 * @param  array $path
 * @param  mixed $default
 * @return mixed
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
