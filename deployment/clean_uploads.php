<?php

$existing_file_paths = DB::fetchCol("SELECT file_path FROM file");

$dont_remove_paths = [];
foreach ($existing_file_paths as $file_path) {
    $file_name = Files::getFileNameWithoutExtension($file_path);
    $file_ext = Files::getFileExtension($file_path);

    $dont_remove_paths[] = $file_path;

    if (in_array($file_ext, Files::$minify_extensions)) {
        $image_data = Files::getResponsiveImageData($file_path);
        if ($image_data) {
            foreach (Files::$image_fixed_dimensions as $size_name => $area) {
                foreach (Files::$image_minified_formats as $format) {
                    $min_file_path = UPLOADS_PATH . $size_name . "/" . $file_name . "." . $format;
                    $dont_remove_paths[] = $min_file_path;
                }
            }
        }
    }
}

Files::scanDirectories(["include_paths" => ["uploads"]], function ($path) use ($dont_remove_paths) {
    if (!in_array($path, $dont_remove_paths)) {
        @unlink($path);
    }
});
