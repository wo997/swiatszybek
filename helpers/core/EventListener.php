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
    public static function dispatch($name, $params = null)
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
