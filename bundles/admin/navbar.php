<hr>
<div class="admin_shortcuts">
    <div class="header">Szybki dostęp</div>
    <a href="<?= Request::$static_urls["ADMIN"] ?>/produkty-w-sklepie?dodaj" class="link">
        Dodaj produkt
    </a>
    <a href="<?= Request::$static_urls["ADMIN"] ?>/kody-rabatowe?utworz" class="link">
        Utwórz kod rabatowy
    </a>
</div>
<hr>

<?php

function renderPageItem($page)
{
    $arrow_btn = "";
    if (isset($page["sub"])) {
        $arrow_btn = "<div class='btn transparent expand_arrow' onclick='expandMenu($(this)._parent()._next(),$(this)._parent(),null,{single:true})'><i class='fas fa-chevron-right'></i></div>";
    }

    $title = "";
    $hidden = "";
    if (isset($page["title"])) {
        $title = $page["title"];
    } else {
        $hidden = "hidden";
    }

    $onclick = isset($page["onclick"]) ? "onclick=\"$page[onclick]\"" : "";

    $href = isset($page["url"]) ? ("href='" . Request::$static_urls["ADMIN"] . $page["url"] . "'") : "";
    $notifications = renderNotification(def($page, "notification_count", 0));

    echo "<div class='menu_item $hidden'>
            <a $href $onclick>$title $notifications</a>
            $arrow_btn
        </div>";

    if (isset($page["sub"])) {
        echo "<div class='sub_menu expand_y hidden animate_hidden'>";
        foreach ($page["sub"] as $sub_page) {
            renderPageItem($sub_page);
        }
        echo "</div>";
    }
}

$admin_navigations_tree = getAdminNavitationTree();

foreach ($admin_navigations_tree as $page) {
    renderPageItem($page);
}
