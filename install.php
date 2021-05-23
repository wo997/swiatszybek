<?php

// remove all annotations, it would work really well man

/*$delete_files = [];

$delete_files = array_merge($delete_files, array_values($link_route_path));
$delete_files = array_merge($delete_files, array_values($link_module_path));

foreach ($link_event_paths as $file_paths) {
    foreach ($file_paths as $file_path) {
        $delete_files[] = $file_path;
    }
}

foreach ($css_schema as $group) {
    foreach ($group as $file_path) {
        $delete_files[] = $file_path;
    }
}

// it has changed the structure ;)

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
    $zip->extractTo('./');
    $zip->close();
    echo 'ok';
} else {
    echo 'failed';
}

// default values?

/*
settingator would be nice to use here, for undefined vars etc
*/

include "deployment/warmup_cache.php";
