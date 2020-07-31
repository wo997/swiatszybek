<?php

function triggerEvent($event_name, $args = [])
{
    global $link_event_paths;
    foreach (nonull($link_event_paths, $event_name, []) as $path) {
        $input = $args;
        include $path;
    }
}
