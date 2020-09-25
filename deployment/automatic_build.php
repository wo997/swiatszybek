<?php

$base_path = str_replace("\\", "/", getcwd()) . "/";

$modificationTimePHP = 0;
$modificationTimeCSS = 0;
$modificationTimeJS = 0;
$modificationTimeModules = 0;

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
        "include_paths" => ["modules"]
    ],
    function ($path, $first_line) {
        global $modificationTimePHP, $modificationTimeCSS, $modificationTimeJS, $modificationTimeModules;

        $mtime = filemtime($path);

        if (
            getAnnotationPHP("module", $first_line)
            || getAnnotation("module", $first_line)
            || getAnnotation("module_block", $first_line)
            || getAnnotation("module_block_form", $first_line)
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

$anyChange = false;
$phpChange = false;
$cssChange = false;
$jsChange = false;
$modulesChange = false;
// only when url is different than deployment so we can debug the app
if (strpos(nonull($_GET, 'url', ""), "deployment") !== 0) {
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

    if ($anyChange) {
        $content = <<<PHP
<?php
    \$previousModificationTimePHP = $modificationTimePHP;
    \$previousModificationTimeCSS = $modificationTimeCSS;
    \$previousModificationTimeJS = $modificationTimeJS;
    \$previousModificationTimeModules = $modificationTimeModules;
    \$versionPHP = $versionPHP;
    \$versionCSS = $versionCSS;
    \$versionJS = $versionJS;
    \$versionModules = $versionModules;
PHP;
        file_put_contents(BUILD_INFO_PATH, $content);
    }

    if ($phpChange || $modulesChange) {
        ob_start();
        triggerEvent("build", ["modules" => $modulesChange]);
        ob_clean();
    }

    if ($anyChange) {
        triggerEvent("assets_change", ["css" => $cssChange, "js" => $jsChange]);
        reload();
    }
}
