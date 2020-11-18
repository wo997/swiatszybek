<?php

function triggerEvent($event_name, $args = [])
{
    $output = [];
    global $link_event_paths, $app;
    foreach (nonull($link_event_paths, $event_name, []) as $path) {
        // args passed in
        $res = include $path;
        if (is_array($res)) {
            $output = array_merge($output, $res);
        }
    }
    return $output;
}
