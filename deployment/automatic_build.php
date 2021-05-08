<?php

if (isset($_GET["no_build"])) {
    return;
}

$mod_time_php = 0;
$mod_time_assets = 0;
$mod_time_modules = 0;
$mod_time_settings = 0;

$modified_packages = [];

Files::scanDirectories(
    [
        "exclude_paths" => ["vendor", "uploads", "modules", "settings", "builds"], // , "deployment"
        "get_first_line" => true,
    ],
    function ($path, $first_line) use (&$mod_time_php, &$mod_time_assets, &$modified_packages) {
        $mtime = filemtime($path);
        if (strpos($path, ".php")) {
            $mod_time_php += $mtime;
        } else {
            $ext = Files::getFileExtension($path);
            if (in_array($ext, ["css", "scss", "js"])) {
                $modified_package = Files::getAnnotation("css", $first_line);
                if (!$modified_package) {
                    $modified_package = Files::getAnnotation("js", $first_line);
                }
                if ($modified_package) {
                    $modified_package = str_replace("!", "", $modified_package);
                    if (!in_array($modified_package, $modified_packages)) {
                        $modified_packages[] = $modified_package;
                    }
                }

                $mod_time_assets += $mtime;
            }
        }
    }
);

Files::scanDirectories(
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

//sendEmail("wojtekwo997@gmail.com", Request::$full_url . " => " . (Request::$is_deployment_url ? 100 : 1), "xxx");

if (!Request::$is_deployment_url) {
    if ($any_changed) {
        $build_res = file_get_contents(SITE_URL . "/deployment/build"); // a token might be necessary for safety purpose
    }
}
