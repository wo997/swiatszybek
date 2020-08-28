<?php

$project_directories = [
    UPLOADS_PATH,
    BUILDS_PATH,
    UPLOADS_PLAIN_PATH,
    UPLOADS_VIDEOS_PATH,
];

foreach ($image_default_dimensions as $size_name => $area) {
    $project_directories[] = UPLOADS_PATH . $size_name;
}

foreach ($project_directories as $directory) {
    createDir($directory);
}
