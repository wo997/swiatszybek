<?php

$base_path = str_replace("\\", "/", getcwd()) . "/";

$modificationTimePHP = 0;
$modificationTimeCSS = 0;
$modificationTimeJS = 0;
$modificationTimeModules = 0;
$modificationTimeSettings = 0;

scanDirectories(
    [
        "include_paths" => $deployable_paths,
        "exclude_paths" => ["modules"],
    ],
    function ($path) {
        global $modificationTimePHP, $modificationTimeCSS, $modificationTimeJS;

        $mtime = filemtime($path);
        if (strpos($path, ".php")) {
            $modificationTimePHP += $mtime;
        } else if (strpos($path, ".css")) {
            $modificationTimeCSS += $mtime;
        } else if (strpos($path, ".js")) {
            $modificationTimeJS += $mtime;
        }
    }
);

scanDirectories(
    [
        "get_first_line" => true,
        "include_paths" => ["modules"],
    ],
    function ($path, $first_line) {
        global $modificationTimePHP, $modificationTimeCSS, $modificationTimeJS, $modificationTimeModules;

        $mtime = filemtime($path);

        // same in scan modules ;)
        if (
            getAnnotationPHP("module", $first_line)
            || getAnnotation("module", $first_line)
            || getAnnotation("module_block", $first_line)
            || getAnnotation("module_block_form", $first_line)
            || getAnnotationPHP("module_form", $first_line)
        ) {
            $modificationTimeModules += $mtime;
            // else is important, no need to upgrade
        } else if (strpos($path, ".php")) {
            $modificationTimePHP += $mtime;
        } else if (strpos($path, ".css")) {
            $modificationTimeCSS += $mtime;
        } else if (strpos($path, ".js")) {
            $modificationTimeJS += $mtime;
        }
    }
);

scanDirectories(
    [
        "get_first_line" => true,
        "include_paths" => ["settings"],
    ],
    function ($path, $first_line) {
        global $modificationTimeSettings;

        $mtime = filemtime($path);

        $modificationTimeSettings += $mtime;
    }
);

$anyChange = false;
$phpChange = false;
$cssChange = false;
$jsChange = false;
$modulesChange = false;
$settingsChange = false;
// only when url is different than deployment so we can debug the app
if (!IS_DEPLOYMENT_URL) {
    if ($previousModificationTimePHP != $modificationTimePHP) {
        $anyChange = true;
        $phpChange = true;
        $versionPHP++;
    }

    if ($previousModificationTimeCSS != $modificationTimeCSS) {
        $anyChange = true;
        $cssChange = true;
        $versionCSS++;
    }

    if ($previousModificationTimeJS != $modificationTimeJS) {
        $anyChange = true;
        $jsChange = true;
        $versionJS++;
    }

    if ($previousModificationTimeModules != $modificationTimeModules) {
        $anyChange = true;
        $modulesChange = true;
        $versionModules++;
    }

    $settingsChange = false;
    if ($previousModificationTimeSettings != $modificationTimeSettings) {
        $settingsChange = true;
        $versionSettings++;
    }

    if ($anyChange || true) {
        $content = <<<PHP
<?php
    \$previousModificationTimePHP = $modificationTimePHP;
    \$previousModificationTimeCSS = $modificationTimeCSS;
    \$previousModificationTimeJS = $modificationTimeJS;
    \$previousModificationTimeModules = $modificationTimeModules;
    \$previousModificationTimeSettings = $modificationTimeSettings;
    \$versionPHP = $versionPHP;
    \$versionCSS = $versionCSS;
    \$versionJS = $versionJS;
    \$versionModules = $versionModules;
    \$versionSettings = $versionSettings;
PHP;
        saveFile(BUILD_INFO_PATH, $content);
    }

    if ($phpChange || $modulesChange) {
        ob_start();
        triggerEvent("build", ["modules" => $modulesChange, "settings" => false]);
        ob_clean();
    }

    if ($settingsChange) {
        triggerEvent("settings_change");
    }

    if ($anyChange) {
        triggerEvent("assets_change", ["css" => $cssChange, "js" => $jsChange]);
        reload(true);
    }
}
