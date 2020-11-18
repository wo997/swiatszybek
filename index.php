<?php

require "secrets.php";

// I would use a single run script instead, but that can be tricky
if (!isset($_GET["token"]) || $_GET["token"] !== $secrets["deployment_token"]) {
    die("Brak klucza do instalacji");
}

$zip_file_path = 'piepsklep.zip';

// not sure about this either
chmod(getcwd() . "/", 755);

$zip = new ZipArchive;
if ($zip->open($zip_file_path) === TRUE) {
    $zip->extractTo(getcwd() . "/");
    $zip->close();
    header("Location: /");
    die;
} else {
    echo 'Błąd instalacji!';
}

include "kernel.php";
include "deployment/warmup_cache.php";
