<?php

/**
 * Use this function to fetch all data quickly from preloaded JSON
 * $path: array
 */
function setting($path, $default = "")
{
    return nonull(SETTINGS, $path, $default);
}

function getSetting($dir, $file, $json_path, $default = null)
{
    $res = getSettings($dir, $file, [$json_path]);
    if ($res) {
        return $res[0];
    }
    return $default;
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
            $settings_sub = &$settings;
            $found = true;
            foreach ($json_path as $json_path_part) {
                if (isset($settings_sub[$json_path_part])) {
                    $settings_sub = &$settings_sub[$json_path_part];
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

function saveSetting($dir, $file, $json_path_and_value)
{
    saveSettings($dir, $file, [$json_path_and_value]);
}

function saveSettings($dir, $file, $json_paths_and_values)
{
    $file_path = SETTINGS_PATH . $dir . "/" . $file . ".json";

    if (file_exists($file_path)) {
        $settings = json_decode(file_get_contents($file_path), true);
    }
    if (!$settings) {
        $settings = [];
    }

    while (true) {
        $is_flat = true;

        foreach ($json_paths_and_values as $key => $json_path_and_value) {
            $path = $json_path_and_value["path"];
            $value = $json_path_and_value["value"];

            if (is_array($value)) {
                $is_flat = false;

                foreach ($value as $s_key => $s_value) {
                    $another_path = $path;
                    $another_path[] = $s_key;
                    $json_paths_and_values[] = [
                        "path" => $another_path,
                        "value" =>  $s_value,
                    ];
                }

                unset($json_paths_and_values[$key]);
            }
        }

        if ($is_flat) {
            break;
        }
    }

    foreach ($json_paths_and_values as $json_path_and_value) {
        $path = $json_path_and_value["path"];
        $value = $json_path_and_value["value"];

        $settings_sub = &$settings;

        foreach ($path as $path_part) {
            // we probably lose reference
            if (!is_array($settings_sub)) {
                $settings_sub = [];
            }
            if (!isset($settings_sub[$path_part])) {
                $settings_sub[$path_part] = [];
            }
            $settings_sub = &$settings_sub[$path_part];
        }
        $settings_sub = $value;
    }
    saveFile($file_path, json_encode($settings));
}
