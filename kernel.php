<?php

// in case e-mails are not configured (for debugging), kinda weird it's not a part of settings, it's more like a dev mode in reality, there is a need to define it on the code level
define("DISPLAY_EMAIL", false);

include "scripts/start_session.php";
include 'vendor/autoload.php';
include "scripts/errors.php";

include "scripts/include_core_helpers.php";
include "scripts/request.php";
include "scripts/define_paths.php";

include "scripts/settings.php";
include "scripts/server_settings.php";

include "scripts/use_builds.php";
if (def($_SESSION, "backend_access", false)) {
    include "deployment/automatic_build.php";
}
define("ASSETS_RELEASE", $version_assets);

//ini_set('max_execution_time', '1000');
ini_set('max_execution_time', '5');

include "scripts/set_time_zone.php";

//include "helpers/simple_html_dom.php";

// ssl redirect
if (getSetting(["general", "advanced", "ssl"]) == 1 && def($_SERVER, "HTTPS", "on") == 'off') {
    Request::redirect(strReplaceFirst("http://", "https://", SITE_URL, 1));
}

$secrets = [];
@include "secrets.php";
function secret($var, $default = "")
{
    global $secrets;
    return def($secrets, $var, $default);
}

include "scripts/db_connect.php";

if (DEV_MODE) {
    include "scripts/errors.php";
}
@include BUILDS_PATH . "hooks/entity.php"; // must be here cause the entity def is necessary run some migrations
include "scripts/entities.php";
@include BUILDS_PATH . "hooks/helper.php";
@include BUILDS_PATH . "hooks/event.php";

include "scripts/images.php";
include "scripts/previews.php";

// TODO: move to a module / can trigger an event here
// if (isset($_SESSION["p24_back_url"]) && strpos($_GET["url"], "oplacono") !== 0) {
//     header("Location: /oplacono");
//     die;
// }

// TODO: move to the FB module instead
//include 'helpers/facebook_register.php';
