<?php

ini_set('max_execution_time', '1000');

$zip = new ZipArchive();
$zip->open('piepsklep.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);

scanDirectories(
    [
        "include_paths" => [
            "admin", "cron", "deployment", "event_listeners", "global", "helpers", "img", "migrations", "modules", "node_modules", "packages", "src", "user", "vendor", "theme",
            ".htaccess", "kernel.php", "routing.php", "ping.php", "robots.txt"
        ]
    ],
    function ($path) {
        global $zip;
        $zip->addFile($path);
    }
);

$zip->close();
