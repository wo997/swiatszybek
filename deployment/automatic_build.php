<?php

$base_path = str_replace("\\", "/", getcwd()) . "/";

$modificationTimePHP = 0;
$modificationTimeCSS = 0;
$modificationTimeJS = 0;

scanDirectories(
    [
        "include_paths" => $deployable_paths
    ],
    function ($path) {
        global $modificationTimePHP, $modificationTimeCSS, $modificationTimeJS;

        if (strpos($path, ".php")) {
            $modificationTimePHP += filemtime($path);
        } else if (strpos($path, ".css")) {
            $modificationTimeCSS += filemtime($path);
        } else if (strpos($path, ".js")) {
            $modificationTimeJS += filemtime($path);
        }
    }
);

$anyChange = false;
$cssChange = false;
$jsChange = false;
// only when url is different than deployment so we can debug the app
if (strpos(nonull($_GET, 'url', ""), "deployment") !== 0) {
    if ($previousModificationTimePHP != $modificationTimePHP) {
        $anyChange = true;
        ob_start();
        include "deployment/build.php";
        ob_clean();
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

    if ($anyChange) {
        $content = <<<PHP
<?php
    \$previousModificationTimePHP = $modificationTimePHP;
    \$previousModificationTimeCSS = $modificationTimeCSS;
    \$previousModificationTimeJS = $modificationTimeJS;
    \$versionPHP = $versionPHP;
    \$versionCSS = $versionCSS;
    \$versionJS = $versionJS;
PHP;
        file_put_contents($build_info_path, $content);
    }

    triggerEvent("assets_change", ["css" => $cssChange, "js" => $jsChange]);
}
