<?php
session_start();

require_once 'vendor/autoload.php';

define("RELEASE", 2141);

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

$SITE_URL = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $domain;
// I would recommend moving it to $app global var

$currency = "PLN"; // used by p24

// use db
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
date_default_timezone_set("Europe/Warsaw");
require "database.php";

// define app scope
$app = [];

// include helpers
include_once "helpers/date.php";
include_once "helpers/string.php";
include_once "helpers/rating.php";

include_once "helpers/db.php";

include_once "helpers/user.php";

include_once "helpers/email.php";

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

require_once 'helpers/facebook_register.php'; // should be a part of FB module instead


initUser();

validateBasket();
validateStock();
getBasketData();

if (isset($_SESSION["p24_back_url"]) && strpos($_GET["url"], "oplacono") !== 0) {
  header("Location: /oplacono");
  die;
}

include "deployment/automatic_build.php";
