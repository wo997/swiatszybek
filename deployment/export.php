<?php


$include_paths = [
    "bundles", "cron", "deployment", "helpers", "modules", "node_modules", "scripts", "packages", "src", "vendor", "entities",
    ".htaccess", "kernel.php", "routing.php", "ping.php", "robots.txt"
];

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
        echo "x";
        $zip->addFile($path);
    }
);

$zip->close();
