<?php

echo "<style>body{font-family: Verdana;font-size:14px}</style>";

include "deployment/create_directories.php";

include "deployment/migrate.php";

triggerEvent("topmenu_change");

include "deployment/scan_annotations.php";
