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
            $name = $path;
            $name = str_replace("settings/modules", "module", $name);
            $name = str_replace("settings/", "", $name);
            $name = str_replace(".json", "", $name);
            $name = str_replace("/", "_", $name);

            $_settings[$name] = json_decode(file_get_contents($path), true);
        }
    }
);

file_put_contents(BUILDS_PATH . "settings.json", json_encode($_settings));
