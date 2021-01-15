<?php

function triggerEvent($event_name, $args = [])
{
    $output = [];
    global $link_event_paths, $app;
    foreach (def($link_event_paths, $event_name, []) as $path) {
        // args passed in
        $res = include $path;
        if ($res) {
            $output[] = $res;
        }
    }
    return $output;
}
