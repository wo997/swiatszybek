<?php

define("APP_PATH", str_replace("\\", "/", getcwd()) . "/");
define("BUILDS_PATH", "builds/");
define("UPLOADS_PATH", "uploads/");
define("UPLOADS_PLAIN_PATH", UPLOADS_PATH . "-/");
define("UPLOADS_VIDEOS_PATH", UPLOADS_PATH . "videos/");

define("SETTINGS_PATH", "settings/");
define("MODULE_SETTINGS_PATH", SETTINGS_PATH . "modules/");
define("THEME_SETTINGS_PATH", SETTINGS_PATH . "theme/");
define("GENERAL_SETTINGS_PATH", SETTINGS_PATH . "general/");

define("BUILD_INFO_PATH", BUILDS_PATH . "build_info.json");

define("PREBUILDS_PATH", "prebuilds/");
