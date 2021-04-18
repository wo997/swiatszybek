<?php

define("time", microtime(true));

require_once 'kernel.php';

// final conclusion - no need to fix in case ssl is inactive, connection is marked as unsafe, but still can enter the page
if (getSetting(["general", "advanced", "ssl"])) {
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

function getAdminNavitationTree()
{
    global $admin_navigations_tree;
    return $admin_navigations_tree;
}

$admin_navigations_tree = [
    ["url" => "/pulpit", "title" => '<i class="fas fa-th-large"></i> Pulpit / Sprzedaż'],
    [
        "title" => '<i class="fas fa-shopping-bag"></i> Zamówienia', "quick_menu" => true,
        "sub" => [
            ["url" => "/zamowienia", "title" => '<i class="fas fa-clipboard-list"></i> Lista zamówień'],
            //["url" => "/statusy", "title" => '<i class="fas fa-hourglass-half"></i> Statusy zamówień'],
            //["url" => "/statusy-wewnetrzne", "title" => '<i class="fas fa-bookmark"></i> Statusy wewnętrzne'],
        ]
    ],
    [
        "title" => '<i class="fas fa-cube"></i> Produkty',
        "sub" => [
            ["url" => "/produkty", "title" => '<i class="fas fa-cubes"></i> Wszystkie produkty'],
            ["url" => "/produkt", "title" => '<i class="fas fa-plus-circle"></i> Dodaj produkt'],
            ["url" => "/kategorie-produktow", "title" => '<i class="fas fa-folder-open"></i> Kategorie'],
            ["url" => "/cechy-produktow", "title" => '<i class="fas fa-star"></i> Cechy'],
        ],
    ],
    [
        "title" => '<i class="fas fa-user"></i> Użytkownicy', "quick_menu" => true,
        "sub" => [
            ["url" => "/uzytkownicy", "title" => '<i class="fas fa-users"></i> Lista użytkowników'],
            ["url" => "/oczekujacy", "title" => '<i class="fas fa-clock"></i> Oczekujący'],
            ["url" => "/komentarze", "title" => '<i class="fas fa-comment"></i> Komentarze'],
            //["url" => "/newsletter", "title" => '<i class="fas fa-newspaper"></i> Newsletter'],
        ]
    ],
    [
        "title" => '<i class="fas fa-chart-pie"></i> Marketing', "quick_menu" => true,
        "sub" => [
            //["url" => "/sprzedaz", "title" => '<i class="fas fa-chart-line"></i> Sprzedaż'],
            ["url" => "/kody-rabatowe", "title" => '<i class="fas fa-tags"></i> Kody rabatowe'],
            ["url" => "/kody-rabatowe?dodaj", "title" => '<i class="fas fa-plus-circle"></i> Utwórz kod rabatowy'],
            //["url" => "/zestawy", "title" => '<i class="fas fa-layer-group"></i> Zestawy'], // nah
        ]
    ],
    ["url" => "/wysylki", "title" => '<i class="fas fa-shipping-fast"></i> Wysyłki'],
    ["url" => "/dane-firmy", "title" => '<i class="fas fa-building"></i> Dane firmy'],
    [
        "title" => '<i class="fas fa-pencil-alt"></i> Zawartość / Wygląd',
        "sub" => [
            // ["url" => "/strony", "title" => '<i class="fas fa-file-alt"></i> Strony'],
            // ["url" => "/strona"],
            ["url" => "/nowe-strony", "title" => '<i class="fas fa-heart"></i> Nowe Strony'],
            //["url" => "/nowy-cms"],
            ["url" => "/pliki-zdjecia", "title" => '<i class="fas fa-images"></i> Pliki / Zdjęcia'],
            ["url" => "/pliki-zdjecia?przeslij", "title" => '<i class="fas fa-file-upload"></i> Prześlij plik'],
            //["url" => "/menu-glowne", "title" => '<i class="fas fa-bars"></i> Menu główne'],
            //["url" => "/stopka", "title" => '<i class="fas fa-window-maximize" style="transform:rotate(180deg)"></i> Stopka'],
            ["url" => "/logo-ikony", "title" => '<i class="fas fa-star"></i> Logo / Ikony'],
            ["url" => "/ustawienia-motywu", "title" => '<i class="fas fa-cogs"></i> Ustawienia motywu'],
        ]
    ],
    ["url" => "/zaawansowane", "title" => '<i class="fas fa-cog"></i> Zaawansowane'],
    //["url" => "/moduly", "title" => '<i class="fas fa-puzzle-piece"></i> Moduły'],
    //["url" => "/maile", "title" => '<i class="fas fa-envelope"></i> Maile'],
];

function getNotificationCountForPage($page, $children_notification_count = 0)
{
    $notification_count = $children_notification_count;
    if (isset($page['url'])) {
        if ($page['url'] == "/zamowienia") {
            $notification_count += DB::fetchVal("SELECT COUNT(1) FROM shop_order WHERE status_id IN (2)");
        } //else if ($page['url'] == "/komentarze") {
        //$notification_count += DB::fetchVal("SELECT COUNT(1) FROM comments WHERE accepted = 0");
        //} else if ($page['url'] == "/oczekujacy") {
        //$notification_count += DB::fetchVal("SELECT COUNT(1) FROM notifications WHERE sent = 0");
        //}
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

if (Request::$is_admin_url) {
    Security::adminRequired();
}

if (Request::$is_user_url) {
    Security::loginRequired();
}

if (Request::$is_admin_url) {
    // set notification_count for each page at each level
    foreach ($admin_navigations_tree as $key => $admin_navigations_branch) {
        $children_notification_count = 0;
        if (isset($admin_navigations_branch['sub'])) {
            foreach ($admin_navigations_branch['sub'] as $skey => $sub_navigation) {
                $notification_count = getNotificationCountForPage($sub_navigation);
                $admin_navigations_tree[$key]['sub'][$skey]['notification_count'] = $notification_count;
                $children_notification_count += $notification_count;
            }
        }
        $admin_navigations_tree[$key]['notification_count'] = getNotificationCountForPage($admin_navigations_branch, $children_notification_count);
    }

    $admin_navigations = []; // flatten admin page array
    foreach ($admin_navigations_tree as $key => $admin_navigations_branch) {
        if (isset($admin_navigations_branch['sub'])) {
            foreach ($admin_navigations_branch['sub'] as &$sub_navigation) {
                $admin_navigations[] = $sub_navigation;
            }
        }
        $admin_navigations[] = $admin_navigations_branch;
    }

    foreach ($admin_navigations_tree as $key => $admin_navigations_branch) {
        if (!isset($admin_navigations_branch["url"]) && isset($admin_navigations_branch["sub"]) && count($admin_navigations_branch["sub"]) > 0) {
            $admin_navigations_tree[$key]["url"] = $admin_navigations_branch["sub"][0]["url"];
        }
    }
}

$deployment_routes = [
    "/deployment/build",
    "/deployment/migrate",
    "/deployment/warmup_cache",
    "/deployment/warmup_images",
    "/deployment/export",
    "/deployment/install",
    "/deployment/get_size",
];

$routes = [];

foreach ($deployment_routes as $route) {
    $routes[] = $route;
}

$pageName = "";

$found = false;

$pageName = checkUrl(Request::$url);

function checkUrl($url)
{
    global $routes, $link_route_path;

    foreach ($link_route_path as $route => $file) // new routing
    {
        if (strpos($url . "/", $route . "/") === 0 || $url == $route) {
            Request::$route = $route;
            define("ROUTE", $route);
            return $file;
        }
    }

    foreach ($routes as $page) // deprecated
    {
        if (strpos($url . "/", $page . "/") === 0 || $url == $page) {
            return ltrim($page, "/") . ".php";
        }
    }

    return null;
}

if ($pageName) {
    // hardcoded page example - will be removed in the future
    if (!Request::$is_deployment_url) {
        $page_data = DB::fetchRow(
            "SELECT seo_description, seo_title FROM cms WHERE link LIKE ? ORDER BY LENGTH(link) ASC LIMIT 1",
            [Request::urlParam(0) . "%"] // TODO: WARNING: that seems to be so wrong
        );
    }

    include $pageName;
    die;
} else {

    $canSee = User::getCurrent()->priveleges["backend_access"] ? "1" : "published = 1";
    $page_data = DB::fetchRow("SELECT cms_id, seo_description, seo_title, content, published FROM cms WHERE $canSee AND link LIKE ? LIMIT 1", [ltrim(Request::$url, "/")]);

    if (isset($_POST["content"])) {
        $page_data["content"] = $_POST["content"];
    }

    if ($page_data) {
        include "bundles/global/cms_page.php";
        die;
    }
}
if (Request::$url == "/") {
    $page_data["content"] = "Pusta strona";
    include "bundles/global/cms_page.php";
    die;
}

header("Location: /");
die;
