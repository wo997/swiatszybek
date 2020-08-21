<?php

$base_path = str_replace("\\", "/", getcwd()) . "/";

function getModificationTimeTotal($parent_dir = "")
{
    global $base_path, $build_time_lock_path;

    $time = 0;

    $exclude = ["vendor", "uploads", "tmp", "builds", $build_time_lock_path];
    foreach (scandir($base_path . $parent_dir) as $file) {
        $path = $parent_dir . $file;
        if (substr($file, 0, 1) == "." || in_array($file, $exclude)) {
            continue;
        }
        if (is_dir($path)) {
            $time += getModificationTimeTotal($path . "/");
        } else if (strpos($file, ".php")) {
            $time += filemtime($path);
        }
    }
    return $time;
}

if (strpos(nonull($_GET, 'url', ""), "deployment") !== 0) {
    // only when url is different than deployment maybe?
    $build_time_lock_path = "build_time.lock";
    $last_modification_time = file_exists($build_time_lock_path) ? file_get_contents($build_time_lock_path) : "";
    $modification_time = getModificationTimeTotal();

    if ($last_modification_time != $modification_time) {
        //var_dump($last_modification_time, $modification_time);
        file_put_contents($build_time_lock_path, $modification_time); // must go first
        file_get_contents("$SITE_URL/deployment/build"); // trigger build automatically
    }
}
