<?php

class Templates
{
    public static $sections = [];
    public static $current_section_name = null;

    public static function startSection($section_name)
    {
        if (self::$current_section_name) {
            self::endSection();
        }
        ob_start();
        self::$current_section_name = $section_name;
    }

    public static function endSection()
    {
        if (!self::$current_section_name) return;
        self::$sections[self::$current_section_name] = def(self::$sections, [self::$current_section_name], "") . ob_get_clean();
        self::$current_section_name = null;
    }
}
