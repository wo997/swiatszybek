<?php

class PiepCMSManager
{
    public static $modules = [];

    public static function registerModule($module)
    {
        self::$modules[$module["name"]] = $module;
    }
}
