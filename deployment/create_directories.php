<?php

$project_directories = [
    "uploads",
    BUILDS_PATH
];

foreach ($project_directories as $directory) {
    createDir($directory);
}
