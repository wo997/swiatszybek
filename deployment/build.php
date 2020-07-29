<?php

echo "<style>body{font-family: Verdana;font-size:14px}</style>";

include "deployment/migrate.php";

include "events/topmenu_change.php";

include "deployment/scan_routes.php";
