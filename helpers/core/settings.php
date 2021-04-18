<?php

/**
 * @typedef JsonPathAndValue {
 * path: array
 * value: any
 * }
 */

/**
 * saveSetting
 *
 * @param  mixed $dir
 * @param  mixed $file
 * @param  JsonPathAndValue $json_path_and_value
 * @param  mixed $merge
 * @return void
 */
function saveSetting($dir, $file, $json_path_and_value, $merge = true)
{
    saveSettings($dir, $file, [$json_path_and_value], $merge);
}

/**
 * saveSettings
 *
 * @param  mixed $dir
 * @param  mixed $file
 * @param  JsonPathAndValue[] $json_paths_and_values
 * @param  mixed $merge
 * @return void
 */
function saveSettings($dir, $file, $json_paths_and_values, $merge = true)
{
    $file_path = SETTINGS_PATH . $dir . "/" . $file . ".json";

    if (file_exists($file_path)) {
        $settings = json_decode(file_get_contents($file_path), true);
    }
    if (!$settings) {
        $settings = [];
    }

    if ($merge) {
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
    Files::save($file_path, json_encode($settings));
}

function buildSettings()
{
    $_settings = [];

    scanDirectories(
        [
            "include_paths" => ["settings"],
        ],
        function ($path) use (&$_settings) {
            if (strpos($path, ".json")) {
                $first = true;
                $_sub_settings = &$_settings;
                foreach (explode("/", str_replace(".json", "", $path)) as $path_part) {
                    if ($first) {
                        $first = false;
                        continue;
                    }
                    if (!isset($_sub_settings[$path_part])) {
                        $_sub_settings[$path_part] = [];
                    }
                    $_sub_settings = &$_sub_settings[$path_part];
                }

                $_sub_settings = json_decode(file_get_contents($path), true);
            }
        }
    );

    $sp = BUILDS_PATH . "settings.json";
    $res = json_encode($_settings);

    if (file_get_contents($sp) !== $res) {
        Files::save($sp, $res);
    }
}
