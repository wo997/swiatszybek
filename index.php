<?php

require_once 'kernel.php';

if (config("ssl")) {
  if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === "off") {
    $location = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $location);
    exit;
  }  
}
else {
  if ( !(empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === "off") ) {
    $location = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $location);
    exit;
  }
}



$admin_navigations_tree = [
  ["url" => "zamowienia", "title" => '<i class="fas fa-clipboard-list"></i> Zamówienia', "quick_menu" => true],
  ["url" => "statystyki", "title" => '<i class="fas fa-chart-line"></i> Statystyki', "quick_menu" => true],
  ["url" => "produkty", "title" => '<i class="fas fa-cube"></i> Produkty',
    "sub" => [
      ["url" => "produkty", "title" => '<i class="fas fa-cubes"></i> Wszystkie produkty'],
      ["url" => "magazyn", "title" => '<i class="fas fa-list-ol"></i> Magazyn'],
      ["url" => "kategorie", "title" => '<i class="fas fa-folder-open"></i> Kategorie'],
      ["url" => "atrybuty", "title" => '<i class="fas fa-check-square"></i> Atrybuty'],
    ]
  ],
  ["url" => "uzytkownicy", "title" => '<i class="fas fa-user"></i> Użytkownicy', "quick_menu" => true,
    "sub" => [
      ["url" => "uzytkownicy", "title" => '<i class="fas fa-users"></i> Wszyscy użytkownicy'],
      ["url" => "oczekujacy", "title" => '<i class="fas fa-clock"></i> Oczekujący'],
      ["url" => "komentarze", "title" => '<i class="fas fa-comment"></i> Komentarze'],
      ["url" => "newsletter", "title" => '<i class="fas fa-newspaper"></i> Newsletter'],
    ]
  ],
  ["url" => "kody-rabatowe", "title" => '<i class="fas fa-tag"></i> Kody rabatowe', "quick_menu" => true],
  ["url" => "konfiguracja/dostawa", "title" => '<i class="fas fa-shipping-fast"></i> Dostawa', "base_url" => "konfiguracja"],
  ["url" => "konfiguracja/firma", "title" => '<i class="fas fa-building"></i> Dane firmy', "base_url" => "konfiguracja"],
  ["url" => "strony", "title" => '<i class="fas fa-pencil-alt"></i> Zawartość stron',
    "sub" => [
      ["url" => "strony", "title" => '<i class="fas fa-file-alt"></i> Strony'],
      ["url" => "menu-glowne", "title" => '<i class="fas fa-bars"></i> Menu główne'],
      ["url" => "slider", "title" => '<i class="fas fa-images"></i> Slider'],
    ]
  ],
  ["url" => "konfiguracja/serwer", "title" => '<i class="fas fa-cog"></i> Zaawansowane', "base_url" => "konfiguracja"],
];

function getNotificationCountForPage(&$page,$children_notification_count = 0) {
  $notifcation_count = $children_notification_count;
  if (isset($page['url'])) {
    if ($page['url'] == "admin/zamowienia") {
      $notifcation_count += fetchValue("SELECT COUNT(1) FROM zamowienia WHERE status IN (0,1) AND zamowienie_id > 103");
    } else if ($page['url'] == "admin/komentarze") {
      $notifcation_count += fetchValue("SELECT COUNT(1) FROM comments WHERE accepted = 0");
    } else if ($page['url'] == "admin/oczekujacy") {
      $notifcation_count += fetchValue("SELECT COUNT(1) FROM notifications WHERE sent = 0");
    }
  }
  return $notifcation_count;
}

function renderNotification($notifcation_count) {
  if ($notifcation_count > 0) {
    return "<span class='red-notification'>$notifcation_count</span>";
  }
  return "";
}

function setDefaultsForAdminPage(&$page) {
  if (!isset($page["base_url"])) {
    $page["base_url"] = $page["url"];
  }
  $page["url"] = "admin/".$page["url"];
  $page["base_url"] = "admin/".$page["base_url"];
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

// set notifcation_count for each page at each level
foreach ($admin_navigations_tree as &$admin_navigations_branch) {
  $children_notification_count = 0;
  if (isset($admin_navigations_branch['sub'])) {
    foreach ($admin_navigations_branch['sub'] as &$sub_navigation) {
      $sub_navigation['notifcation_count'] = getNotificationCountForPage($sub_navigation);
      $children_notification_count += $sub_navigation['notifcation_count'];
    }
    unset($sub_navigation);
  }
  $admin_navigations_branch['notifcation_count'] = getNotificationCountForPage($admin_navigations_branch,$children_notification_count);
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

$user_routes = [
  "deployment/build",
  "deployment/migrate"
];

$routes = [];

/*foreach ($admin_navigations as $admin_navigation) {
  $routes[] = $admin_navigation["base_url"];
}*/

/*foreach ($admin_routes as $admin_route) {
  $routes[] = $admin_route;
}*/
foreach ($user_routes as $route) {
  $routes[] = $route;
}
//$admin_routes

$routes[] = "admin/podglad_strony";

//$main = 0;
$pageName = "";

$url = "";
if (isset($_GET['url']))
  $url = rtrim($_GET['url'],"/");
//else $url = $pages[$main];

$found = false;

$scanned_routes = @include "scanned_routes.php";
if (!$scanned_routes) {
  $scanned_routes = [];
}
$pageName = checkUrl($url);

$url_params = explode("/",$url);

function checkUrl($url) {
  global $routes, $scanned_routes;
  
  foreach ($scanned_routes as $route => $file) // new routing
  {
    if (strpos($url."/",$route."/") === 0 || $url == $route)
    {
      return $file;
      //return ltrim($file,"/");
    }
  }

  foreach ($routes as $page) // deprecated
  {
    if (strpos($url."/",$page."/") === 0 || $url == $page)
    {
      return $page.".php";
    }
  }

  return null;
}

$page_data["cms_id"] = null;
if ($pageName == "admin/podglad_strony.php") {
  $page_data["content"] = isset($_POST["content"]) ? $_POST["content"] : "Pusta strona"; 
  $page_data["metadata"] = isset($_POST["metadata"]) ? $_POST["metadata"] : null; 
  
  include "cms_page.php";
  die;
}
else if ($pageName) {
  $stmt = $con->prepare("SELECT meta_description, title FROM cms WHERE link LIKE ? ORDER BY LENGTH(link) ASC LIMIT 1");

  $url_like = explode("/", $url)[0] . "%";
  $stmt->bind_param("s", $url_like);
  $stmt->execute();
  $stmt->bind_result($page_data["meta_description"], $page_data["title"]);
  mysqli_stmt_fetch($stmt);
  $stmt->close();

  if (strpos($url,"admin") === 0) {
    adminRequired();
  }

  include $pageName;
  die;
}
else {

  $canSee = $app["user"]["is_admin"] ? "1" : "published = 1";
  $page_data = fetchRow("SELECT cms_id, meta_description, title, content, metadata, published FROM cms WHERE $canSee AND link LIKE ? LIMIT 1",[$url]);
  if ($page_data) {
    include "cms_page.php";
    die;
  }
}
if ($url == "") {
  $page_data["content"] = "Pusta strona"; 
  $page_data["metadata"] = null; 
  include "cms_page.php";
  die;
}

header("Location: /");
die;
?>
