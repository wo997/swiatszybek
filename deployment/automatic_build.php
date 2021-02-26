<?php

$base_path = str_replace("\\", "/", getcwd()) . "/";

$mod_time_php = 0;
$mod_time_css = 0;
$mod_time_js = 0;
$mod_time_modules = 0;
$mod_time_settings = 0;

scanDirectories(
    [
        "exclude_paths" => ["vendor", "uploads", "modules", "settings", "builds"],
        "get_first_line" => true,
    ],
    function ($path, $first_line) {
        global $mod_time_php, $mod_time_css, $mod_time_js, $js_dependencies;

        $mtime = filemtime($path);
        if (strpos($path, ".php")) {
            $mod_time_php += $mtime;
            if (getAnnotationRoute($first_line)) {
                $mod_time_css += $mtime;
                $mod_time_js += $mtime;
            }
        } else if (strpos($path, ".css") || strpos($path, ".scss")) {
            $mod_time_css += $mtime;
        } else if (strpos($path, ".js") || in_array($path, $js_dependencies)) {
            $mod_time_js += $mtime;
        }
    }
);

scanDirectories(
    [
        "get_first_line" => true,
        "include_paths" => ["modules"],
    ],
    function ($path, $first_line) {
        global $mod_time_php, $mod_time_css, $mod_time_js, $mod_time_modules;

        $mtime = filemtime($path);

        // same in scan modules ;)
        if (
            getAnnotationPHP("module", $first_line)
            || getAnnotation("module", $first_line)
            || getAnnotation("module_block", $first_line)
            || getAnnotation("module_block_form", $first_line)
            || getAnnotationPHP("module_form", $first_line)
        ) {
            $mod_time_modules += $mtime;
            // else is important, no need to upgrade
        } else if (strpos($path, ".php")) {
            $mod_time_php += $mtime;
        } else if (strpos($path, ".css") || strpos($path, ".scss")) {
            $mod_time_css += $mtime;
        } else if (strpos($path, ".js")) {
            $mod_time_js += $mtime;
        }
    }
);

scanDirectories(
    [
        "get_first_line" => true,
        "include_paths" => ["settings"],
    ],
    function ($path, $first_line) {
        global $mod_time_settings;

        $mtime = filemtime($path);

        $mod_time_settings += $mtime;
    }
);

$any_changed = false;
$php_changed = false;
$css_changed = false;
$js_changed = false;
$modules_changed = false;
$settings_changed = false;

// only when url is different than deployment so we can debug the app
if (!Request::$is_deployment_url) {
    if ($prev_mod_time_php != $mod_time_php) {
        $any_changed = true;
        $php_changed = true;
        $version_php++;
    }

    if ($prev_mod_time_css != $mod_time_css) {
        $any_changed = true;
        $css_changed = true;
        $version_css++;
    }

    if ($prev_mod_time_js != $mod_time_js) {
        $any_changed = true;
        $js_changed = true;
        $version_js++;
    }

    if ($prev_mod_time_modules != $mod_time_modules) {
        $any_changed = true;
        $modules_changed = true;
        $version_modules++;
    }

    $settings_changed = false;
    if ($prev_mod_time_settings != $mod_time_settings) {
        $settings_changed = true;
        $version_settings++;
    }

    if ($any_changed) {
        $content = <<<PHP
<?php
    \$prev_mod_time_php = $mod_time_php;
    \$prev_mod_time_css = $mod_time_css;
    \$prev_mod_time_js = $mod_time_js;
    \$prev_mod_time_modules = $mod_time_modules;
    \$prev_mod_time_settings = $mod_time_settings;
    \$version_php = $version_php;
    \$version_css = $version_css;
    \$version_js = $version_js;
    \$version_modules = $version_modules;
    \$version_settings = $version_settings;
PHP;

        Files::save(BUILD_INFO_PATH, $content);
    }

    if ($php_changed || $modules_changed) {
        ob_start();
        triggerEvent("build", ["modules" => $modules_changed, "settings" => false]);
        ob_clean();
    }

    if ($settings_changed) {
        triggerEvent("settings_change");
    }

    if ($any_changed) {
        triggerEvent("assets_change", ["css" => $css_changed, "js" => $js_changed]);
        Request::reload(true);
    }
}
