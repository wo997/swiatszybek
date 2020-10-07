<?php //event[settings_change]

global $_settings;

$_settings = [];

scanDirectories(
    [
        "include_paths" => ["settings"],
    ],
    function ($path) {
        global $_settings;

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

file_put_contents(BUILDS_PATH . "settings.json", json_encode($_settings));
