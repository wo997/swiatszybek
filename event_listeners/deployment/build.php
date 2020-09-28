<?php //event[build]

echo "<style>body{font-family: Verdana;font-size:14px}</style>";

include "deployment/create_directories.php";

include "deployment/migrate.php";

include "deployment/scan_annotations.php";

if (nonull($args, "modules", true)) {
    triggerEvent("modules_change");
}

if (nonull($args, "settings", true)) {
    triggerEvent("settings_change");
}
