<?php

$include_paths = [
    "admin", "cron", "deployment", "event_listeners", "global", "helpers", "img", "migrations", "modules", "node_modules", "packages", "src", "user", "vendor", "theme",
    ".htaccess", "kernel.php", "routing.php", "ping.php", "robots.txt"
]; // that's wrong af

$exclude_paths = [];

if (isset($_GET["vendor"])) {
    $include_paths = [
        "vendor"
    ];
}

$zip = new ZipArchive();
$zip->open('piepsklep.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE | ZipArchive::CHECKCONS);

Files::scanDirectories(
    [
        "include_paths" => $include_paths,
        "exclude_paths" => $exclude_paths,
    ],
    function ($path) {
        global $zip;
        $zip->addFile($path);
    }
);

$zip->close();
