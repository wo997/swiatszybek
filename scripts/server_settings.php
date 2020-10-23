<?php

define("SITE_URL", (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . getSetting("general", "advanced", ["domain"], ""));
define("DEV_MODE", getSetting("general", "advanced", ["dev_mode"], 1));
define("DEBUG_MODE", getSetting("general", "advanced", ["debug_mode"], 1));
