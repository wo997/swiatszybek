<?php

function createDir($dir)
{
    if (file_exists($dir)) {
        return;
    }
    mkdir($dir);
}

$deployable_paths = [
    "admin", "cron", "deployment", "event_listeners", "global", "helpers", "migrations", "modules", "src", "user", "theme",
    ".htaccess", "kernel.php", "routing.php", "ping.php", "robots.txt",
];
