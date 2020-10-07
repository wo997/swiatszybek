<?php

function getSetting($dir, $file, $json_path)
{
    $res = getSettings($dir, $file, [$json_path]);
    if ($res) {
        return $res[0];
    }
    return null;
}

function getSettings($dir, $file, $json_paths)
{
    $file_path = SETTINGS_PATH . $dir . "/" . $file . ".json";

    if (!file_exists($file_path)) {
        return [];
    }

    try {
        $settings = json_decode(file_get_contents($file_path), true);
        $out = [];
        foreach ($json_paths as $json_path) {
            $settings_sub = $settings;
            $found = true;
            foreach ($json_path as $json_path_part) {
                if (isset($settings_sub[$json_path_part])) {
                    $settings_sub = $settings_sub[$json_path_part];
                } else {
                    $found = false;
                    break;
                }
            }
            if ($found) {
                $out[] = $settings_sub;
            }
        }
        return $out;
    } catch (Exception $e) {
        return null;
    }
}
function saveSettings($dir, $file, $json_paths_and_values)
{
    $file_path = SETTINGS_PATH . $dir . "/" . $file . ".json";

    if (file_exists($file_path)) {
        $settings = json_decode(file_get_contents($file_path), true);
    } else {
        $settings = [];
    }

    foreach ($json_paths_and_values as $json_path_and_value) {
        $settings_sub = &$settings;
        foreach ($json_path_and_value["path"] as $json_path_part) {
            if (!isset($settings_sub[$json_path_part])) {
                $settings_sub[$json_path_part] = [];
            }
            $settings_sub = &$settings_sub[$json_path_part];
        }
        $settings_sub = $json_path_and_value["value"];
    }

    file_put_contents($file_path, json_encode($settings));
}
