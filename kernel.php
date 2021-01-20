<?php

include "scripts/define_paths.php";

// temporary
include "scripts/errors.php";

ini_set('max_execution_time', '1000');

include "scripts/start_session.php";

include_once 'vendor/autoload.php';

include "scripts/init_app.php";

include "scripts/include_core_helpers.php";

// required by CMS
include "packages/simple_html_dom.php";
include "scripts/requests.php";

$secrets = [];
@include_once "secrets.php";
function secret($var, $default = "")
{
    global $secrets;
    return def($secrets, $var, $default);
}

include "scripts/db_connect.php";

// TODO: almost everything should belong to the core, only modules will be included by a //helper[scope] hook
// others
/*include_once "helpers/order.php";
include_once "helpers/activity_log.php";
include_once "helpers/rating.php";

*/

$path = BUILDS_PATH . "include_helpers.php";

include "scripts/use_builds.php";


if (file_exists($path)) {
    include $path;
} else {
    include "deployment/automatic_build.php";
}


// TODO: nice to remember about this function and probably many more like this one
//var_Dump(get_defined_constants()["ADMIN_URL"]);


// TODO: ABANDON and replace with settigs
// global variables
$path = BUILDS_PATH . "config.php";
if (file_exists($path)) {
    include $path;
} else {
    include "deployment/automatic_build.php";
}
function config($var, $default = "")
{
    global $config;
    return def($config, $var, $default);
}

$settings = json_decode(@file_get_contents(BUILDS_PATH . "settings.json"), true);
if (!$settings) {
    $settings = [];
}
define("SETTINGS", $settings);

include "scripts/server_settings.php";
if (DEV_MODE) {
    include "scripts/errors.php";
}
// run always? cause why not
include "deployment/automatic_build.php";

// not earlier than the build cause it could break something
@include BUILDS_PATH . "hooks/helper.php";

// TODO: define or setting
$currency = "PLN"; // used by p24

include "scripts/images.php";
include "scripts/previews.php";

include "scripts/init_user.php";

triggerEvent("request_begin");
// TODO: move to a module / can trigger an event here
if (isset($_SESSION["p24_back_url"]) && strpos($_GET["url"], "oplacono") !== 0) {
    header("Location: /oplacono");
    die;
}

// theme
include "theme/variables.php";

// TODO: move to the FB module instead
include_once 'helpers/facebook_register.php';

include "scripts/preload_data.php";

// in case e-mails are not configured (for debugging), kinda weird it's not a part of settings, it's more like a dev mode in reality, there is a need to define it on the code level
define("DISPLAY_EMAIL", false);
