<?php

function triggerEvent($event_name, $args = [])
{
    $output = [];
    global $link_event_paths;
    foreach (nonull($link_event_paths, $event_name, []) as $path) {
        $input = $args;
        $output[] = include $path;
    }
    return $output;
}
