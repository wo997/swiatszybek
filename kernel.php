<?php

session_start();

require_once 'vendor/autoload.php';

// global variables

require "constants.php";

function config($var, $default = "")
{
  global $config;
  return nonull($config, $var, $default);
}

$secrets = [];
@include "secrets.php"; // overrides empty array

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
  return strtolower(str_replace("--", "-", preg_replace("/[^(a-zA-Z0-9-)]/", "", str_replace($pl, $en, $phrase))));
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

$app = [];

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

if (!isset($_SESSION["basket"]) || empty($_SESSION["basket"]) || $_SESSION["basket"] == "null" || !$_SESSION["basket"]) {
  $b = "{}";
  if (isset($_COOKIE["basket"])) {
    $b = $_COOKIE["basket"];
  }
  $_SESSION["basket"] = $b;
}

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



// db helpers start
function fetchArray($sql, $params = [], $give_response = true)
{
  global $con;
  $stmt = $con->prepare($sql);
  $paramCount = count($params);
  if ($paramCount) $stmt->bind_param(str_repeat("s", $paramCount), ...$params);
  if (!$give_response) {
    $res = $stmt->execute();
  } else {
    $stmt->execute();
    $res = $stmt->get_result()->fetch_all(1);
  }
  $stmt->close();
  return $res;
}

function query($sql, $params = [])
{
  return fetchArray($sql, $params, false);
}

function fetchRow($sql, $params = [])
{
  $res = fetchArray($sql, $params);
  return isset($res[0]) ? $res[0] : [];
}

function fetchColumn($sql, $params = [])
{
  $res = fetchArray($sql, $params);
  if (!isset($res[0]) || !isset(array_keys($res[0])[0])) return [];
  return array_column($res, array_keys($res[0])[0]);
}


function fetchValue($sql, $params = [])
{
  foreach (fetchRow($sql, $params) as $val) return $val;
  return null;
}

function getLastInsertedId()
{
  global $con;
  return mysqli_insert_id($con);
}

function clean($x)
{
  return preg_replace("/[^a-zA-Z0-9_ ]/", "", $x);
}

function escapeSQL($var)
{
  global $con;
  return mysqli_real_escape_string($con, $var);
}

// db helpers end

// db datatable start

function getSearchQuery($data = null)
{
  $query = "";

  $main_search_value = trim($data["main_search_value"]);
  $main_search_value = preg_replace("/\s{2}/", " ", $main_search_value);

  $words = explode(" ", $main_search_value);

  $counter = 0;
  foreach ($words as $word) {
    $counter++;
    if ($counter > 4) break;

    $word = escapeSQL($word);
    if (!$word) {
      continue;
    }

    $query .= " AND (";
    $first = true;
    foreach ($data["main_search_fields"] as $field) {
      if (!$first) $query .= " OR";
      $query .= " $field LIKE '%$word%'";
      $first = false;
    }
    $query .= ")";
  }

  return $query;
}

function getTableData($data = null)
{
  /*
    required POSTS:
    - search
    - rowCount
    - pageNumber

    params: 
    - select
    - from
    - where
    - order
    - main_search_fields

    optional params:
    - renderers
  */

  $rowCount = isset($_POST['rowCount']) ? intval($_POST['rowCount']) : 20;
  $pageNumber = isset($_POST['pageNumber']) ? intval($_POST['pageNumber']) : 0;
  if ($pageNumber < 0) $pageNumber = 0;
  $bottomIndex = $pageNumber * $rowCount;

  $select = isset($data["select"]) ? $data["select"] : "";

  $from = isset($data["from"]) ? $data["from"] : "";

  $where = isset($data["where"]) ? $data["where"] : "";
  if (trim($where) == "") $where = "1";

  $where .= getSearchQuery([
    "main_search_value" => isset($_POST['search']) ? $_POST['search'] : "",
    "main_search_fields" => isset($data["main_search_fields"]) ? $data["main_search_fields"] : []
  ]);

  $group = isset($data["group"]) ? ("GROUP BY " . $data["group"]) : "";

  $order = isset($data["order"]) ? $data["order"] : "";

  
  $countQuery = "SELECT COUNT(1) FROM $from WHERE $where $group";
  
  if ($group) {
    $countQuery = "SELECT COUNT(*) FROM($countQuery) t";
  }

  $totalRows = fetchValue($countQuery);
  $pageCount = ceil($totalRows / $rowCount);

  $results = fetchArray("SELECT $select FROM $from WHERE $where $group ORDER BY $order LIMIT $bottomIndex,$rowCount");

  $index = 0;
  foreach ($results as &$result) {
    $index++;
    $result["kolejnosc"] = $pageNumber * $rowCount + $index;

    if (isset($data["renderers"])) {
      foreach ($data["renderers"] as $field => $renderer) {
        $result[$field] = $renderer($result);
      }
    }
  }
  unset($result);

  return json_encode(["pageCount" => $pageCount, "totalRows" => $totalRows, "results" => $results]);
}

function getListCondition($field, $filter)
{
  $not = substr($filter, 0, 1) === "!" ? "NOT" : "";
  $id_list = preg_replace("/[^\d,]/", "", $filter);
  if ($id_list) return " AND $field $not IN (" . $id_list . ")";
  return " AND $not 0";
}

// db datatable end

// rearrange start

$requiredFilterTables = [
  "product_categories" => "parent_id",
  "menu" => "parent_id",
  "variant" => "product_id",
  "konfiguracja" => "category",
];

function getRequiredFilterQuery($table, $params = [])
{
  global $requiredFilterTables;
  if (isset($requiredFilterTables[$table])) {
    $column_name = $requiredFilterTables[$table];
    if (!isset($params[$column_name])) return false;
    if (is_integer($params[$column_name])) return "$column_name=" . intval($params[$column_name]);
    return "$column_name='" . escapeSQL($params[$column_name]) . "'";
  }
  return "1";
}

function rearrangeTable($table, $primary, $itemId = null, $toIndex = null, $params = [])
{
  $where = getRequiredFilterQuery($table, $params);
  if ($where === false) {
    die("Table must be tree view based!");
    return;
  }

  $primary = clean($primary);

  $idList = fetchColumn("SELECT $primary FROM $table WHERE $where ORDER BY kolejnosc ASC");
  if ($itemId !== null && $toIndex !== null) {
    $itemId = intval($itemId);
    $fromIndex = array_search($itemId, $idList) + 1;

    $toIndex = intval($toIndex);

    if ($toIndex == $fromIndex) return;
    if ($toIndex > $fromIndex) {
      array_splice($idList, $toIndex, 0, [$itemId]);
      array_splice($idList, $fromIndex - 1, 1);
    } else {
      array_splice($idList, $fromIndex - 1, 1);
      array_splice($idList, $toIndex - 1, 0, [$itemId]);
    }
  }

  $i = 0;
  foreach ($idList as $id) {
    $i++;
    query("UPDATE $table SET kolejnosc = $i WHERE $primary = $id");
  }
}

function orderTableBeforeListing($table, $primary, $params = [])
{
  $where = getRequiredFilterQuery($table, $params);
  if ($where === false) return;

  if (
    fetchValue("SELECT 1 FROM $table WHERE kolejnosc = 0") || // any new?
    fetchValue("SELECT 1 FROM $table WHERE $where GROUP BY kolejnosc HAVING COUNT(1) > 1") // duplicates
  ) {
    rearrangeTable($table, $primary, null, null, $params);
  }
}

// rearrange end

$dostawy = ["p" => "Paczkomat", "k" => "Kurier", "o" => "Odbiór osobisty"];

// statuses
$statusList = [
  0 => [
    "title" => "Oczekuje na opłatę",
    "color" => "dd3",
  ],
  1 => [
    "title" => "Opłacono - w realizacji",
    "color" => "3a3",
  ],
  5 => [
    "title" => "Do odbioru",
    "color" => "e90",
  ],
  2 => [
    "title" => "Wysłano",
    "color" => "44d",
  ],
  3 => [
    "title" => "Odebrano",
    "color" => "39c",
  ],
  4 => [
    "title" => "Anulowano",
    "color" => "b33",
  ],
];

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

      $blocks = $container->find(".cms-block");

      foreach ($blocks as $block) {
        if (isset($block->attr["data-module"])) {
          $module = $block->attr["data-module"];
          $block_html = "<div";
          foreach ($block->attr as $key => $val) {
            $block_html .= " $key='$val'";
          }
          $block_html .= ">";

          $moduleParams = isset($block->attr["data-module-params"]) ? json_decode(html_entity_decode($block->attr["data-module-params"]), true) : null;
          $moduleDir = "/modules/$module";
          $moduleFile = "modules/$module/content.php";

          if (file_exists($moduleFile)) {
            $module_content = "";
            include $moduleFile;

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
    $page_content = "<link rel='stylesheet' href='$file'>" . $page_content;
  }
  foreach ($JS_files as $file) {
    $page_content = "<script src='$file'></script>" . $page_content;
  }
  return $page_content;
}

// cms helpers end

if (isset($_SESSION["p24_back_url"]) && strpos($_GET["url"], "oplacono") !== 0) {
  header("Location: /oplacono");
  die;
}




$attribute_data_types = [
  "text" => [
    "description" => "Tekst (lista)",
  ],
  "numberlist" => [
    "description" => "Liczba (lista)",
  ],
  "numberany" => [
    "description" => "Liczba (dowolna)",
  ],
  /*"integer" => [
    "description" => "Liczba całkowita",
  ],
  "decimal" => [  
    "description" => "Liczba zmiennoprzecinkowa",
  ]*/
];
