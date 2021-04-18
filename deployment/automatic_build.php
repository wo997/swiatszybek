<?php

$base_path = str_replace("\\", "/", getcwd()) . "/";

$mod_time_php = 0;
$mod_time_assets = 0;
$mod_time_modules = 0;
$mod_time_settings = 0;

scanDirectories(
    [
        "exclude_paths" => ["vendor", "uploads", "modules", "settings", "builds", "deployment"],
        //"get_first_line" => true,
    ],
    function ($path) use (&$mod_time_php, &$mod_time_assets) {
        $mtime = filemtime($path);
        if (strpos($path, ".php")) {
            $mod_time_php += $mtime;
        } else if (in_array(Files::getFileExtension($path), ["css", "scss", "js", "html"])) {
            $mod_time_assets += $mtime;
        }
    }
);

scanDirectories(
    [
        "include_paths" => ["settings"],
        //"get_first_line" => true,
    ],
    function ($path) {
        global $mod_time_settings;

        $mtime = filemtime($path);

        $mod_time_settings += $mtime;
    }
);


$any_changed = false;
$php_changed = false;
$assets_changed = false;
$settings_changed = false;

//sendEmail("wojtekwo997@gmail.com", Request::$full_url . " => " . (Request::$is_deployment_url ? 100 : 1), "xxx");
if (!Request::$is_deployment_url) {
    if ($prev_mod_time_php != $mod_time_php) {
        $any_changed = true;
        $php_changed = true;
        $version_php++;
    }

    if ($prev_mod_time_assets != $mod_time_assets) {
        $any_changed = true;
        $assets_changed = true;
        $version_assets++;
    }

    if ($prev_mod_time_settings != $mod_time_settings) {
        $any_changed = true;
        $settings_changed = true;
        $version_settings++;
    }

    if ($any_changed) {
        $content = <<<PHP
<?php
    \$prev_mod_time_php = $mod_time_php;
    \$prev_mod_time_assets = $mod_time_assets;
    \$prev_mod_time_settings = $mod_time_settings;
    \$version_php = $version_php;
    \$version_assets = $version_assets;
    \$version_settings = $version_settings;
PHP;

        Files::save(BUILD_INFO_PATH, $content);
    }

    // if ($settings_changed) {
    //     buildSettings();
    // }

    if ($any_changed) {
        $build_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]/deployment/build";
        file_get_contents($build_url); // a token might be necessary for safety purpose
    }
}
