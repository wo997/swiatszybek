<?php
session_start();

require_once 'vendor/autoload.php';

define("BUILDS_PATH", "builds/");
define("UPLOADS_PATH", "uploads/");


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


include_once "helpers/general.php";

// global variables
@include "builds/config.php";
function config($var, $default = "")
{
  global $config;
  return nonull($config, $var, $default);
}

$secrets = [];
@include "secrets.php";
function secret($var, $default = "")
{
  global $secrets;
  return nonull($secrets, $var, $default);
}

$domain = config("domain");
if (!$domain) $domain = $_SERVER["HTTP_HOST"];

define("SITE_URL", (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $domain);

$currency = "PLN"; // used by p24

// use db
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
date_default_timezone_set("Europe/Warsaw");
require "database.php";

// define app scope
$app = [];

// use annotations
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

// include helpers
include_once "helpers/date.php";
include_once "helpers/string.php";
include_once "helpers/rating.php";
include_once "helpers/array.php";
include_once "helpers/directories.php";

include_once "helpers/db/general.php";
include_once "helpers/db/entity.php";
include_once "helpers/db/migration.php";
include_once "helpers/email.php";

include_once "helpers/user.php";

include_once "helpers/events.php";
include_once "helpers/datatable.php";
include_once "helpers/deployment.php";

include_once "helpers/order.php";
include_once "helpers/activity_log.php";
include_once "helpers/images.php";
include_once "helpers/product.php";

include_once "helpers/links.php";

include_once "helpers/layout/cms.php";
include_once "helpers/layout/templates.php";
include_once "helpers/form.php";

require_once 'helpers/facebook_register.php'; // should be a part of FB module instead


initUser();

validateBasket();
validateStock();
getBasketData();

// todo remove or tigger an event here
if (isset($_SESSION["p24_back_url"]) && strpos($_GET["url"], "oplacono") !== 0) {
  header("Location: /oplacono");
  die;
}

$build_info_path = "builds/build_info.php";

// default values - ovverriden by 'build_info'
$previousModificationTimePHP = 0;
$previousModificationTimeCSS = 0;
$previousModificationTimeJS = 0;
$versionPHP = 0;
$versionCSS = 0;
$versionJS = 0;

@include $build_info_path;

include "deployment/automatic_build.php";

define("RELEASE", 2142);
define("CSS_RELEASE", $versionCSS);
define("JS_RELEASE", $versionJS);
