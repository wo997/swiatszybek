<?php

// remove all annotations

/*$delete_files = [];

$delete_files = array_merge($delete_files, array_values($link_route_path));
$delete_files = array_merge($delete_files, array_values($link_module_path));

foreach ($link_event_paths as $file_paths) {
    foreach ($file_paths as $file_path) {
        $delete_files[] = $file_path;
    }
}

$css_schema = @include BUILDS_PATH . "css_schema.php";
if (!$css_schema) {
    $css_schema = [];
}
foreach ($css_schema as $group) {
    foreach ($group as $file_path) {
        $delete_files[] = $file_path;
    }
}

$js_schema = @include BUILDS_PATH . "js_schema.php";
if (!$js_schema) {
    $js_schema = [];
}
foreach ($js_schema as $group) {
    foreach ($group as $file_path) {
        $delete_files[] = $file_path;
    }
}

foreach ($delete_files as $file_path) {
    unlink($file_path);
}*/

// unzip project

$zip = new ZipArchive;
if ($zip->open('piepsklep.zip') === TRUE) {
    $zip->extractTo('/');
    $zip->close();
    echo 'ok';
} else {
    echo 'failed';
}

// default values?

/*
use single savesettings for that shit, on any update as well, tricky man
define("primary_clr", '#b39647');
define("buynow_clr", '#d22');
define("subtle_font_clr", '#333');
define("subtle_background_clr", '#fafafa');
*/

include "deployment/warmup_cache.php";
