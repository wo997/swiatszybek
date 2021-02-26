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

$sp = BUILDS_PATH . "settings.json";
$res = json_encode($_settings);

if (file_get_contents($sp) !== $res) {
    Files::save($sp, $res);
    Request::reload(true);
}
