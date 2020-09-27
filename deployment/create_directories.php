<?php

global $image_default_dimensions;

$project_directories = [
    BUILDS_PATH,

    UPLOADS_PATH,
    UPLOADS_PLAIN_PATH,
    UPLOADS_VIDEOS_PATH,

    SETTINGS_PATH,
    MODULE_SETTINGS_PATH,
];

foreach ($image_default_dimensions as $size_name => $area) {
    $project_directories[] = UPLOADS_PATH . $size_name;
}

foreach ($project_directories as $directory) {
    createDir($directory);
}
