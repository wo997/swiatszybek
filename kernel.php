<?php

if (!isset($_SESSION)) {
    session_start();
}

require_once 'vendor/autoload.php';

// include helpers
include_once "helpers/general.php";
include_once "helpers/debug.php";

include_once "helpers/date.php";
include_once "helpers/string.php";
include_once "helpers/rating.php";
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

include_once "helpers/links.php";

include_once "helpers/layout/cms.php";
include_once "helpers/layout/templates.php";
include_once "helpers/form.php";

include "packages/simple_html_dom.php";

// define WebP support also for XHR requests
define("WEBP_SUPPORT", isset($_SESSION["HAS_WEBP_SUPPORT"]) || strpos($_SERVER['HTTP_ACCEPT'], 'image/webp') !== false ? 1 : 0);
if (WEBP_SUPPORT) {
    $_SESSION["HAS_WEBP_SUPPORT"] = true;
}

//define("IS_XHR", isset($_GET["xhr"]) || $_SERVER['REQUEST_METHOD'] === 'POST');
define("IS_XHR", isset($_GET["xhr"]) || isset($_POST["xhr"]));

define("IS_DEPLOYMENT_URL", strpos(nonull($_GET, 'url', ""), "deployment") === 0);

define("APP_PATH", str_replace("\\", "/", getcwd()) . "/");
define("BUILDS_PATH", "builds/");
define("UPLOADS_PATH", "uploads/");
define("UPLOADS_PLAIN_PATH", UPLOADS_PATH . "-/");
define("UPLOADS_VIDEOS_PATH", UPLOADS_PATH . "videos/");

define("SETTINGS_PATH", "settings/");
define("MODULE_SETTINGS_PATH", "settings/modules/");
define("THEME_SETTINGS_PATH", "settings/theme/");

define("BUILD_INFO_PATH", BUILDS_PATH . "build_info.php");

// default values - overriden by 'build_info'
$previousModificationTimePHP = 0;
$previousModificationTimeCSS = 0;
$previousModificationTimeJS = 0;
$versionPHP = 0;
$versionCSS = 0;
$versionJS = 0;

@include BUILD_INFO_PATH;

// global variables
@require_once "builds/config.php";
function config($var, $default = "")
{
    global $config;
    return nonull($config, $var, $default);
}

$secrets = [];
@require_once "secrets.php";
function secret($var, $default = "")
{
    global $secrets;
    return nonull($secrets, $var, $default);
}

$settings = json_decode(@file_get_contents(BUILDS_PATH . "settings.json"), true);
if (!$settings) {
    $settings = [];
}
function setting($path, $default = "")
{
    global $settings;
    return nonull($settings, $path, $default);
}

$domain = config("domain");
if (!$domain) {
    $domain = $_SERVER["HTTP_HOST"];
}

define("SITE_URL", (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $domain);

define("LOGO_PATH", SITE_URL . "/uploads/df/logo.jpg?v=" . setting(["theme", "copied_images", "logo", "version"], ""));
define("LOGO_PATH_LOCAL", setting(["theme", "copied_images", "logo", "path"], LOGO_PATH));

define("FAVICON_PATH", SITE_URL . "/uploads/df/favicon.jpg?v=" . setting(["theme", "copied_images", "favicon", "version"], ""));
define("FAVICON_PATH_LOCAL", setting(["theme", "copied_images", "favicon", "path"], FAVICON_PATH));

$currency = "PLN"; // used by p24

// use db


date_default_timezone_set("Europe/Warsaw");
require_once "helpers/db/connect.php";

// define app scope
$app = [];

// use builds
$link_route_path = @include BUILDS_PATH . "link_route_path.php";
if (!$link_route_path) {
    $link_route_path = [];
}

$link_module_path = @include BUILDS_PATH . "link_module_path.php";
if (!$link_module_path) {
    $link_module_path = [];
}

$link_event_paths = @include BUILDS_PATH . "link_event_paths.php";
if (!$link_event_paths) {
    $link_event_paths = [];
}

$link_module_block_path = @include BUILDS_PATH . "link_module_block_path.php";
if (!$link_module_block_path) {
    $link_module_block_path = [];
}

$link_module_block_form_path = @include BUILDS_PATH . "link_module_block_form_path.php";
if (!$link_module_block_form_path) {
    $link_module_block_form_path = [];
}

$link_module_form_path = @include BUILDS_PATH . "link_module_form_path.php";
if (!$link_module_form_path) {
    $link_module_form_path = [];
}

initUser();

validateBasket();
validateStock();
prepareBasketData();

// todo remove or tigger an event here
if (isset($_SESSION["p24_back_url"]) && strpos($_GET["url"], "oplacono") !== 0) {
    header("Location: /oplacono");
    die;
}

define("RELEASE", 2137);
define("CSS_RELEASE", $versionCSS);
define("JS_RELEASE", $versionJS);
define("MODULES_RELEASE", $versionModules);

// theme
include "theme/variables.php";

// requests
$just_logged_in = false;

if (!IS_XHR) {
    if (isset($_SESSION["redirect"])) {
        $redirect = $_SESSION["redirect"];
        unset($_SESSION["redirect"]);
        if ($_SERVER["REQUEST_URI"] != $redirect) {
            header("Location: $redirect");
            die;
        }
    }

    if (isset($_SESSION["just_logged_in"])) {
        $just_logged_in = true;
        unset($_SESSION["just_logged_in"]);
    }
}
if (config("dev_mode", true)) {
    include "deployment/automatic_build.php";
}

// errors
if (config("dev_mode", true)) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
}


require_once 'helpers/facebook_register.php'; // should be a part of FB module instead
