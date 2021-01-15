<?php //event[build]

echo "<style>body{font-family: Verdana;font-size:14px}</style>";

include "deployment/create_directories.php";
include "deployment/migrate.php";
include "deployment/scan_annotations.php";

if (def($args, "modules", true)) {
    triggerEvent("modules_change");
}

if (def($args, "settings", true)) {
    triggerEvent("settings_change");
}

if (isset($_SERVER["HTTP_HOST"]) && !getSetting("general", "advanced", ["domain"])) {
    saveSetting("general", "advanced", [
        "path" => ["domain"],
        "value" => $_SERVER["HTTP_HOST"]
    ]);
}
