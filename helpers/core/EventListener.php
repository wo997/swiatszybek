<?php

class EventListener
{
    private static $events = [];

    /**
     * register
     *
     * @param  string $name
     * @param  callback $listener_callback
     * @return void
     */
    public static function register($name, $listener_callback)
    {
        self::$events[$name][] = $listener_callback;
    }

    /**
     * dispatch
     *
     * @param  string $name
     * @param  array $params
     * @return array
     */
    public static function dispatch($name, $params)
    {
        $res = [];
        if (isset(self::$events[$name])) {
            foreach (self::$events[$name] as $listener_callback) {
                $res[] = $listener_callback($params);
            }
        }
        return $res;
    }
}

// deprecated
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
