<?php

// in case e-mails are not configured (for debugging), kinda weird it's not a part of settings, it's more like a dev mode in reality, there is a need to define it on the code level
define("DISPLAY_EMAIL", false);

include "scripts/define_paths.php";

//ini_set('max_execution_time', '1000');
ini_set('max_execution_time', '5');

include "scripts/start_session.php";

include_once 'vendor/autoload.php';

// temp
include "scripts/errors.php";

include "scripts/set_time_zone.php";

include "scripts/init_app.php"; // TODO: remove this lol, static classes are the kings

include "scripts/include_core_helpers.php";

// required by CMS
include "helpers/simple_html_dom.php";
include "scripts/request.php";

$secrets = [];
@include_once "secrets.php";
function secret($var, $default = "")
{
    global $secrets;
    return def($secrets, $var, $default);
}

include "scripts/db_connect.php";

include "scripts/use_builds.php";

$settings = json_decode(@file_get_contents(BUILDS_PATH . "settings.json"), true);
if (!$settings) {
    $settings = [];
}
define("SETTINGS", $settings);

include "scripts/server_settings.php";
if (DEV_MODE) {
    include "scripts/errors.php";
}
@include BUILDS_PATH . "hooks/entity.php"; // must be here cause the entity def is necessary run some migrations
include "scripts/entities.php";
@include BUILDS_PATH . "hooks/helper.php";
@include BUILDS_PATH . "hooks/event.php";

// run always? cause why not
include "deployment/automatic_build.php";

// TODO: define or setting
$currency = "PLN"; // used by p24

include "scripts/images.php";
include "scripts/previews.php";

//triggerEvent("request_begin"); // hooks are way nicer bro

// TODO: move to a module / can trigger an event here
if (isset($_SESSION["p24_back_url"]) && strpos($_GET["url"], "oplacono") !== 0) {
    header("Location: /oplacono");
    die;
}

// TODO: move to the FB module instead
//include_once 'helpers/facebook_register.php';

include "scripts/preload_data.php";
