<?php

/**
 * - $options [exclude_paths, include_paths, get_first_line]<br>
 * - $callback - function($path, ?$first_line)
 * - ?$parent_dir
 */

$_base_path = str_replace("\\", "/", getcwd()) . "/";

function scanDirectories($options = [], $callback, $parent_dir = "", $level = 0)
{
    global $_base_path;
    foreach (scandir($_base_path . $parent_dir) as $file) {
        $path = $parent_dir . $file;
        if (substr($file, 0, 1) == ".") {
            continue;
        }
        if ($level === 0) {
            if (isset($options["exclude_paths"]) && in_array($file, $options["exclude_paths"])) {
                continue;
            }
            if (isset($options["include_paths"]) && !in_array($file, $options["include_paths"])) {
                continue;
            }
        }
        if (is_dir($path)) {
            scanDirectories($options, $callback, $path . "/", $level + 1);
            continue;
        }
        if (isset($options["get_first_line"])) {
            $first_line = nonull(file($path), 0, "");
        } else {
            $first_line = "";
        }

        $callback($path, $first_line, $parent_dir);
    }
}
