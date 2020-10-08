<?php

define("time", microtime(true));

require_once 'kernel.php';

if (config("ssl")) {
  if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === "off") {
    $location = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $location);
    exit;
  }
} else {
  if (!(empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === "off")) {
    $location = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $location);
    exit;
  }
}

$admin_navigations_tree = [
  ["url" => "zamowienia", "title" => '<i class="fas fa-clipboard-list"></i> Zamówienia', "quick_menu" => true],
  ["url" => "statystyki", "title" => '<i class="fas fa-chart-line"></i> Statystyki', "quick_menu" => true],
  [
    "url" => "produkty", "title" => '<i class="fas fa-cube"></i> Produkty',
    "sub" => [
      ["url" => "produkty", "title" => '<i class="fas fa-cubes"></i> Wszystkie produkty'],
      ["url" => "magazyn", "title" => '<i class="fas fa-list-ol"></i> Magazyn'],
      ["url" => "kategorie", "title" => '<i class="fas fa-folder-open"></i> Kategorie'],
      ["url" => "atrybuty", "title" => '<i class="fas fa-check-square"></i> Atrybuty'],
    ]
  ],
  [
    "url" => "uzytkownicy", "title" => '<i class="fas fa-user"></i> Użytkownicy', "quick_menu" => true,
    "sub" => [
      ["url" => "uzytkownicy", "title" => '<i class="fas fa-users"></i> Wszyscy użytkownicy'],
      ["url" => "oczekujacy", "title" => '<i class="fas fa-clock"></i> Oczekujący'],
      ["url" => "komentarze", "title" => '<i class="fas fa-comment"></i> Komentarze'],
      ["url" => "newsletter", "title" => '<i class="fas fa-newspaper"></i> Newsletter'],
    ]
  ],
  ["url" => "kody-rabatowe", "title" => '<i class="fas fa-tag"></i> Kody rabatowe', "quick_menu" => true],
  ["url" => "konfiguracja/dostawa", "title" => '<i class="fas fa-shipping-fast"></i> Dostawa', "base_url" => "konfiguracja"],
  ["url" => "dane-firmy", "title" => '<i class="fas fa-building"></i> Dane firmy'],
  [
    "url" => "strony", "title" => '<i class="fas fa-pencil-alt"></i> Zawartość / Wygląd',
    "sub" => [
      ["url" => "strony", "title" => '<i class="fas fa-file-alt"></i> Strony'],
      ["url" => "menu-glowne", "title" => '<i class="fas fa-bars"></i> Menu główne'],
      //["url" => "slider", "title" => '<i class="fas fa-images"></i> Slider'],
      ["url" => "stopka", "title" => '<i class="fas fa-window-maximize" style="transform:rotate(180deg)"></i> Stopka'],
      ["url" => "logo-ikony", "title" => '<i class="far fa-star"></i> Logo / Ikony'],

    ]
  ],
  ["url" => "konfiguracja/serwer", "title" => '<i class="fas fa-cog"></i> Zaawansowane', "base_url" => "konfiguracja"],
  ["url" => "moduly", "title" => '<i class="fas fa-puzzle-piece"></i> Moduły'],
];

function getNotificationCountForPage(&$page, $children_notification_count = 0)
{
  $notification_count = $children_notification_count;
  if (isset($page['url'])) {
    if ($page['url'] == "admin/zamowienia") {
      $notification_count += fetchValue("SELECT COUNT(1) FROM zamowienia WHERE status_id IN (0,1)");
    } else if ($page['url'] == "admin/komentarze") {
      $notification_count += fetchValue("SELECT COUNT(1) FROM comments WHERE accepted = 0");
    } else if ($page['url'] == "admin/oczekujacy") {
      $notification_count += fetchValue("SELECT COUNT(1) FROM notifications WHERE sent = 0");
    }
  }
  return $notification_count;
}

function renderNotification($notification_count)
{
  if ($notification_count > 0) {
    return "<span class='red-notification'>$notification_count</span>";
  }
  return "";
}

function setDefaultsForAdminPage(&$page)
{
  if (!isset($page["base_url"])) {
    $page["base_url"] = $page["url"];
  }
  $page["url"] = "admin/" . $page["url"];
  $page["base_url"] = "admin/" . $page["base_url"];
}

// set defaults for admin pages
foreach ($admin_navigations_tree as &$admin_navigations_branch) {
  if (isset($admin_navigations_branch['sub'])) {
    foreach ($admin_navigations_branch['sub'] as &$sub_navigation) {
      setDefaultsForAdminPage($sub_navigation);
    }
    unset($sub_navigation);
  }
  setDefaultsForAdminPage($admin_navigations_branch);
}

// set notification_count for each page at each level
foreach ($admin_navigations_tree as &$admin_navigations_branch) {
  $children_notification_count = 0;
  if (isset($admin_navigations_branch['sub'])) {
    foreach ($admin_navigations_branch['sub'] as &$sub_navigation) {
      $sub_navigation['notification_count'] = getNotificationCountForPage($sub_navigation);
      $children_notification_count += $sub_navigation['notification_count'];
    }
    unset($sub_navigation);
  }
  $admin_navigations_branch['notification_count'] = getNotificationCountForPage($admin_navigations_branch, $children_notification_count);
}

$admin_navigations = []; // flatten admin page array
foreach ($admin_navigations_tree as &$admin_navigations_branch) {
  if (isset($admin_navigations_branch['sub'])) {
    foreach ($admin_navigations_branch['sub'] as &$sub_navigation) {
      $admin_navigations[] = $sub_navigation;
    }
    unset($sub_navigation);
  }
  $admin_navigations[] = $admin_navigations_branch;
}
unset($admin_navigations_branch);

$deployment_routes = [
  "deployment/build",
  "deployment/migrate",
  "deployment/warmup_cache",
  "deployment/export",
  "deployment/install",
];

$routes = [];

foreach ($deployment_routes as $route) {
  $routes[] = $route;
}
$routes[] = "admin/podglad_strony";

$pageName = "";

$url = "";
if (isset($_GET['url']))
  $url = rtrim($_GET['url'], "/");

$found = false;

$pageName = checkUrl($url);

$url_params = explode("/", $url);

function checkUrl($url)
{
  global $routes, $link_route_path;

  foreach ($link_route_path as $route => $file) // new routing
  {
    if (strpos($url . "/", $route . "/") === 0 || $url == $route) {
      return $file;
    }
  }

  foreach ($routes as $page) // deprecated
  {
    if (strpos($url . "/", $page . "/") === 0 || $url == $page) {
      return $page . ".php";
    }
  }

  return null;
}

if ($pageName) {
  if (strpos($url, "deployment") !== 0) {
    $page_data = fetchRow(
      "SELECT seo_description, seo_title FROM cms WHERE link LIKE ? ORDER BY LENGTH(link) ASC LIMIT 1",
      [explode("/", $url)[0] . "%"]
    );
  }

  if (strpos($url, "admin") === 0) {
    adminRequired();
  }

  include $pageName;
  die;
} else {

  $canSee = $app["user"]["priveleges"]["backend_access"] ? "1" : "published = 1";
  $page_data = fetchRow("SELECT cms_id, seo_description, seo_title, content, published FROM cms WHERE $canSee AND link LIKE ? LIMIT 1", [$url]);

  if (isset($_POST["content"])) {
    $page_data["content"] = $_POST["content"];
  }

  if ($page_data) {
    include "user/cms_page.php";
    die;
  }
}
if ($url == "") {
  $page_data["content"] = "Pusta strona";
  include "user/cms_page.php";
  die;
}

header("Location: /");
die;
