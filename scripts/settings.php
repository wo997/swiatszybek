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
    global $settings;
    return def($settings, $path, $default);
}

global $settings;
$settings = json_decode(@file_get_contents(BUILDS_PATH . "settings.json"), true);
if (!$settings) {
    $settings = [];
}
