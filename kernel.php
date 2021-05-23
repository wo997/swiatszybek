<?php

ini_set('max_execution_time', '1000');
//ini_set('max_execution_time', '5');

// in case e-mails are not configured (for debugging), kinda weird it's not a part of settings, it's more like a dev mode in reality, there is a need to define it on the code level
define("DISPLAY_EMAIL", false);

include "scripts/start_session.php";
include 'vendor/autoload.php';
include "scripts/set_time_zone.php";
//include "scripts/errors.php";

include "scripts/include_core_helpers.php";
include "scripts/request.php";
include "scripts/define_paths.php";

include "scripts/settings.php";
include "scripts/server_settings.php";

if (DEV_MODE) {
    include "scripts/errors.php";
}

$secrets = [];
@include "secrets.php";
function secret($var, $default = "")
{
    global $secrets;
    return def($secrets, $var, $default);
}

include "scripts/db_connect.php";


$build_info = json_decode(@file_get_contents(BUILD_INFO_PATH), true);
if (!$build_info || def($_SESSION, "backend_access", false)) { // so a dev can work
    if (!isset($_GET["no_build"])) {
        include "deployment/automatic_build.php";
    }
}


// ssl redirect
if (getSetting(["general", "advanced", "ssl"]) == 1 && def($_SERVER, "HTTPS", "on") == 'off') {
    Request::redirect(strReplaceFirst("http://", "https://", SITE_URL, 1));
}

// entity must be first cause the entity def is necessary run some migrations
foreach (["entity", "helper", "event", "register"] as $hook_name) {
    foreach (def($build_info, ["hooks", $hook_name], []) as $path) {
        @include $path;
    }
}
include "scripts/entities.php";

include "scripts/build_pages.php";

include "scripts/images.php";
