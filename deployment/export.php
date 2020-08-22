<?php

ini_set('max_execution_time', '1000');

function processDir($parent_dir, $level = 0)
{
    global $_base_path, $zip;

    $include = [];
    if ($level === 0) {
        $include = [
            "admin", "cron", "deployment", "event_listeners", "global", "helpers", "img", "migrations", "modules", "node_modules", "packages", "src", "user", "vendor",
            ".htaccess", "kernel.php", "routing.php", "ping.php", "robots.txt"
        ];
    }

    foreach (scandir($_base_path . $parent_dir) as $file) {
        if ($file == "." || $file == "..") {
            continue;
        }
        $path = $parent_dir . $file;
        if ($include && !in_array($file, $include)) {
            continue;
        }

        if (is_dir($path)) {
            processDir($path . "/", $level + 1);
            continue;
        } else {
            $zip->addFile($path);
        }
    }
}

$_base_path = str_replace("\\", "/", getcwd()) . "/";

$zip = new ZipArchive();
$zip->open('piepsklep.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);

processDir("");

$zip->close();
