<?php
session_start();

require_once 'vendor/autoload.php';

define("RELEASE", 2142);

define("BUILDS_PATH", "builds/");

// include helpers

include_once "helpers/db.php";

include_once "helpers/datatable.php";

include_once "helpers/order.php";

include_once "helpers/deployment.php";

include_once "helpers/events.php";

// global variables

require "constants.php";

function config($var, $default = "")
{
  global $config;
  return nonull($config, $var, $default);
}

$secrets = [];
require "secrets.php"; // overrides empty array

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

// services
require_once 'helpers/facebook_register.php';
require_once 'login_user.php'; // TODO: it's dumb to split it like that

// db
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
date_default_timezone_set("Europe/Warsaw");
require "database.php";

// helpers

function getProductLink($product_id, $link)
{
  global $SITE_URL;
  return "$SITE_URL/produkt/$product_id/" . getLink($link);
}

function getZamowienieLink($link)
{
  global $SITE_URL;
  return "$SITE_URL/zamowienie/$link";
}

$specificTime = abs(floor(microtime(true) * 100) % 1000); // return with refresh, no longer used, supports shit servers

function getLink($phrase)
{ // also shared.js
  $pl = array(',', ' ', 'ę', 'Ę', 'ó', 'Ó', 'ą', 'Ą', 'ś', 'Ś', 'ł', 'Ł', 'ż', 'Ż', 'ź', 'Ź', 'ć', 'Ć', 'ń', 'Ń');
  $en = array('-', '-', 'e', 'E', 'o', 'O', 'a', 'A', 's', 'S', 'l', 'L', 'z', 'Z', 'z', 'Z', 'c', 'C', 'n', 'N');
  return strtolower(preg_replace("/-+/", "-", preg_replace("/[^(a-zA-Z0-9-)]/", "", str_replace($pl, $en, $phrase))));
}

function getMenuLink($menu_item)
{
  $title = "";
  $url = "";

  if ($menu_item["url"]) {
    $title = $menu_item["url"];
    $url = $menu_item["url"];
  } else if ($menu_item["cms_url"]) {
    $title = $menu_item["cms_title"];
    $url = "/" . $menu_item["cms_url"];
  } else if ($menu_item["product_id"]) {
    $title = $menu_item["product_title"];
    $url = getProductLink($menu_item["product_id"], $menu_item["product_link"]);
  }
  return ["title" => $title, "url" => $url];
}

function oneline($str)
{
  return str_replace("\n", " ", htmlspecialchars($str));
}

function ratingBlock($rating)
{
  $d = fmod($rating - 0.25, 1);
  $half = $d < 0.5 ? "rating" . round($rating - 0.75) . "5" : "";

  return $rating == 0 ? '' : '<div class="rating rating' . round($rating + 0.25) . ' ' . $half . '">
      <span><img src="/img/star-gray.png"></span>
      <span><img src="/img/star-gray.png"></span>
      <span><img src="/img/star-gray.png"></span>
      <span><img src="/img/star-gray.png"></span>
      <span><img src="/img/star-gray.png"></span>
    </div>';
}

$m_pol = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

function dateDifference($time)
{
  global $m_pol;

  $date_time = strtotime($time);

  $diff = time() - $date_time;

  if ($diff < 60) {
    return "Przed chwilą";
  } else if ($diff < 3600) {
    $m = floor($diff / 60);
    if ($m == 1) return "minutę temu";
    else if ($m == 2 || $m == 3 || $m == 4) return $m . " minuty temu";
    else return $m . " minut temu";
  } else if ($diff < 12 * 3600) {
    $m = floor($diff / 3600);
    if ($m == 1) return "godzinę temu";
    else if ($m == 2 || $m == 3 || $m == 4) return $m . " godziny temu";
    else return $m . " godzin temu";
  } else {
    return date("d", $date_time) . " " . $m_pol[intval(substr($time, 5, 2)) - 1] . " " . date("Y", $date_time);
  }
}

function niceDate($time = null)
{
  global $m_pol;

  if (!$time) $time = date("Y-m-d");

  $date_time = strtotime($time);

  return date("d", $date_time) . " " . $m_pol[intval(substr($time, 5, 2)) - 1] . " " . date("Y", $date_time);
}

// define app scope
$app = [];

if (!isset($_SESSION["user"]) && isset($_COOKIE["remember_me_token"])) {
  $user_data = fetchRow("SELECT * FROM `users` WHERE user_type = 's' AND authenticated = 1 AND remember_me_token = ?", [$_COOKIE["remember_me_token"]]);
  if ($user_data) {
    login_user($user_data["user_id"], $user_data["email"], "s", ["name" => $user_data["email"]], false);
  }
}

if (isset($_SESSION["user"])) {
  $app["user"] = $_SESSION["user"];
} else {
  $app["user"] = [
    "id" => null,
    "is_admin" => false,
    "type" => "",
    "email" => ""
  ];
}

if (empty($_SESSION["basket"]) || $_SESSION["basket"] == "null" || !$_SESSION["basket"]) {
  $b = "[]";
  if (isset($_COOKIE["basket"])) {
    $b = $_COOKIE["basket"];
  }
  $_SESSION["basket"] = $b;
}

// validate basket
try {
  $basket = json_decode($_SESSION["basket"], true);

  if ($basket === null) {
    throw new Exception('json parse error');
  }

  foreach ($basket as $basket_item) {
    if (
      !isset($basket_item["variant_id"])
      || !isset($basket_item["quantity"])
    ) {
      throw new Exception('missing content');
      break;
    }
  }
} catch (Exception $e) {
  $_SESSION["basket"] = "[]";
  $_COOKIE["basket"] = "[]";
}

require "helpers/order/get_basket_data.php";

require "helpers/order/validate_stock.php";


function nonull($arr, $key, $default = "")
{
  return isset($arr[$key]) ? $arr[$key] : $default;
}

function getTrackingLink($track, $dostawa, $dostawa_name)
{
  global $config;
  if (!$track) return "";
  $track = htmlspecialchars($track);
  if ($dostawa == 'k') {
    return $config['kurier_tracking'] . $track;
  } else if ($dostawa == 'p') {
    return $config['paczkomat_tracking'] . $track;
  }
  return "";
}


function adminRequired()
{
  global $app;
  if (!$app["user"]["is_admin"]) {
    $_SESSION["redirect"] = $_SERVER["REQUEST_URI"];
    header("Location: /logowanie");
    die;
  }
}


// send emails
$default_headers  = 'MIME-Version: 1.0' . "\r\n";
$default_headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
$default_headers .= 'From: ' . config('main_email_sender') . ' <' . config('main_email') . "> \r\n" .
  'Reply-To: ' . config('main_email') . "\r\n" .
  'X-Mailer: PHP/' . phpversion();

function sendEmail($recipient, $message, $title, $headers = null, $from = null)
{
  global $default_headers;
  if ($headers === null) {
    $headers = $default_headers;
  }
  if ($from === null) {
    $from = config('main_email');
  }
  $title = "=?UTF-8?B?" . base64_encode($title) . "?=";
  mail($recipient, $title, $message, $headers, "-f " . $from);
}

function getEmailHeader($lang)
{
  $person = "";
  if ($lang["firma"]) {
    $person = nonull($lang, "firma", "");
  } else {
    $person = nonull($lang, "imie", "") . " " . nonull($lang, "nazwisko", "");
  }

  return "<p style='font-size: 16px;max-width:700px'>$person,<br><br>";
}

function getEmailFooter()
{
  global $SITE_URL;
  return "\n<br><br><i>Pozdrawiamy,</i><br><a href='$SITE_URL'><img src='$SITE_URL/img/logo.png' style='width:200px'></a></p>";
}



function renderStatus($status_id)
{ // shared.js
  global $statusList;
  return "<div class='rect' style='background:#" . $statusList[$status_id]["color"] . "'>" . $statusList[$status_id]["title"] . "</div>";
}

function getLogString($who, $log)
{ // deprecated
  return "$who (" . date("Y-m-d H:i") . ") <br>$log<br><br>";
}

function addLogForZamowienie($zamowienie_id, $log, $who = null)
{ // deprecated
  global $app;
  if (!$who) $who = $app["user"]["email"];
  query("UPDATE zamowienia SET history = CONCAT(history,?) WHERE zamowienie_id = $zamowienie_id", [getLogString($who, $log)]);
}

function addZamowienieLog($log, $zamowienie_id, $log_user_id = null)
{
  addLog($log, $log_user_id, "order", $zamowienie_id);
}

function addLog($log, $log_user_id = null, $scope = "", $scope_item_id = null)
{
  global $app;
  if (!$log_user_id) $log_user_id = $app["user"]["id"];
  query("INSERT INTO activity_log (log, user_id, scope, scope_item_id) VALUES (?,?,?,?)", [
    $log, $log_user_id, $scope, $scope_item_id
  ]);
}

// render template

$current_section_name = null;
function startSection($section_name)
{
  global $current_section_name;
  if ($current_section_name) {
    endSection();
  }
  ob_start();
  global $current_section_name;
  $current_section_name = $section_name;
}
$sections = [];
function endSection()
{
  global $current_section_name, $sections;
  if (!$current_section_name) return;
  $sections[$current_section_name] = ob_get_clean();
  $current_section_name = null;
}
/*function renderTemplate($template_name) {
  global $con, $admin_navigations;
  if ($template_name == "admin_page") {
    include "admin/default_page.php";
  }
}*/

// render template end


// cms helpers start

$JS_files = [];
$CSS_files = [];
function useJS($file)
{
  global $JS_files;
  if (!in_array($file, $JS_files)) {
    $JS_files[] = $file;
  }
}
function useCSS($file)
{
  global $CSS_files;
  if (!in_array($file, $CSS_files)) {
    $CSS_files[] = $file;
  }
}
function getCMSPageHTML($content)
{
  global $JS_files, $CSS_files, $app;

  include "packages/simple_html_dom.php";

  $html = str_get_html($content);

  $page_content = "";

  if ($html) {

    $links = $html->find("*[data-href]");
    foreach ($links as $link) {
      $link->outertext = "<a href=" . $link->attr["data-href"] . ">" . $link->outertext . "</a>";
    }

    $ytvideos = $html->find("img.ql-video");
    foreach ($ytvideos as $ytvideo) {
      $img = $ytvideo->attr["src"];
      preg_match('/https:\/\/img.youtube.com\/vi\/.*\/hqdefault.jpg/', $img, $out);
      foreach ($out as $url) {
        $id = str_replace(["https://img.youtube.com/vi/", "/hqdefault.jpg"], "", $url);
        $style = isset($ytvideo->attr["style"]) ? $ytvideo->attr["style"] : "";
        $ytvideo->outertext = '<iframe style="' . $style . '" class="ql-video" src="https://www.youtube.com/embed/' . $id . '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        break;
      }
    }

    $container_html = "";
    $containers = $html->find(".cms-container");
    foreach ($containers as $container) {

      $container_html .= "<div";
      foreach ($container->attr as $key => $val) {
        $container_html .= " $key='$val'";
      }

      $container_html .= '><div class="cms-container-content"';

      $container_content = $container->find(".cms-container-content")[0];

      foreach ($container_content->attr as $key => $val) {
        $container_html .= " $key='$val'";
      }

      $container_html .= '>';

      $blocks = $container_content->find(".cms-block");

      foreach ($blocks as $block) {
        if (isset($block->attr["data-module"])) {
          $module = $block->attr["data-module"];
          $block_html = "<div";
          foreach ($block->attr as $key => $val) {
            $block_html .= " $key=\"$val\"";
          }
          $block_html .= ">";

          $moduleParams = isset($block->attr["data-module-params"]) ? json_decode(html_entity_decode($block->attr["data-module-params"]), true) : null;
          $moduleDir = "modules/$module";
          $moduleContentFile = "$moduleDir/content.php";

          if (file_exists($moduleContentFile)) {
            $module_content = "";
            include $moduleContentFile;

            $block_html .= "<div class='cms-block-content'>$module_content</div>";
            $block_html .= "</div>";

            $container_html .= $block_html;
          }
        } else $container_html .= $block->outertext;
      }

      $container_html .= "</div></div>";
    }

    $page_content .= $container_html;
  }

  foreach ($CSS_files as $file) {
    $page_content = "<link rel='stylesheet' href='$file?v=" . RELEASE . "'>" . $page_content;
  }
  foreach ($JS_files as $file) {
    $page_content = "<script src='$file?v=" . RELEASE . "'></script>" . $page_content;
  }
  return $page_content;
}

// cms helpers end

if (isset($_SESSION["p24_back_url"]) && strpos($_GET["url"], "oplacono") !== 0) {
  header("Location: /oplacono");
  die;
}


$attribute_data_types = [
  "textlist" => [
    "description" => "Tekst (lista)",
  ],
  "numberlist" => [
    "description" => "Liczba (lista)",
  ],
  "numberany" => [
    "description" => "Liczba (dowolna)",
    "field" => "numerical_value"
  ],
  "colorany" => [
    "description" => "Kolor (dowolny)",
    "field" => "text_value",
  ],
  "dateany" => [
    "description" => "Data (dowolna)",
    "field" => "date_value"
  ],
  "textany" => [
    "description" => "Tekst (dowolny)",
    "field" => "text_value"
  ],
  /*"integer" => [
    "description" => "Liczba całkowita",
  ],
  "decimal" => [  
    "description" => "Liczba zmiennoprzecinkowa",
  ]*/
];

// image upload definition start
$image_default_dimensions = [ // pick higher of width and height
  "lg" => 1600,
  "md" => 800,
  "sm" => 350,
];
// image upload definition end
