<?php

include "scripts/start_session.php";

include_once 'vendor/autoload.php';

include "scripts/init_app.php";

// include helpers start
include_once "helpers/general.php";
include_once "helpers/debug.php";

include_once "helpers/date.php";
include_once "helpers/string.php";
include_once "helpers/number.php";
include_once "helpers/array.php";
include_once "helpers/files.php";
include_once "helpers/settings.php";

include_once "helpers/db/general.php";
include_once "helpers/db/entity.php";
include_once "helpers/db/migration.php";

include_once "helpers/email.php";
include_once "helpers/request.php";

include_once "helpers/user.php";

include_once "helpers/events.php";
include_once "helpers/datatable.php";
include_once "helpers/deployment.php";

include_once "helpers/order.php";
include_once "helpers/activity_log.php";
include_once "helpers/product.php";
include_once "helpers/rating.php";

include_once "helpers/links.php";

include_once "helpers/layout/cms.php";
include_once "helpers/layout/templates.php";
include_once "helpers/form.php";

include_once "helpers/email_notifications.php";
// include helpers end

// required by CMS
include "packages/simple_html_dom.php";

// TODO: nice to remember about this function and probably many more like this one
//var_Dump(get_defined_constants()["ADMIN_URL"]);

include "scripts/define_paths.php";

include "scripts/use_builds.php";

// TODO: abanbon and replace with settigs
// global variables
@include_once "builds/config.php";
function config($var, $default = "")
{
    global $config;
    return nonull($config, $var, $default);
}

// TODO: should we even have them here? db connection vars can come from a single file
$secrets = [];
@include_once "secrets.php";
function secret($var, $default = "")
{
    global $secrets;
    return nonull($secrets, $var, $default);
}

$settings = json_decode(@file_get_contents(BUILDS_PATH . "settings.json"), true);
if (!$settings) {
    $settings = [];
}

include "scripts/server_settings.php";

// TODO: define or setting
$currency = "PLN"; // used by p24

include "scripts/db_connect.php";
include "scripts/errors.php";

include "scripts/requests.php";
include "scripts/images.php";
include "scripts/previews.php";

include "scripts/init_user.php";

// TODO: more to a module / can trigger an event here
if (isset($_SESSION["p24_back_url"]) && strpos($_GET["url"], "oplacono") !== 0) {
    header("Location: /oplacono");
    die;
}

// theme
include "theme/variables.php";

if (DEV_MODE) {
    include "deployment/automatic_build.php";
}


// TODO: move to the FB module instead
include_once 'helpers/facebook_register.php';

include "scripts/preload_data.php";

// in case e-mails are not configured (for debugging), kinda weird it's not a part of settings, it's more like a dev mode in reality, there is a need to define it on the code level
define("DISPLAY_EMAIL", false);
