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

    echo "<div class='menu_item $hidden'>
            <a href='" . Request::$static_urls["ADMIN"] . def($page, "url") . "'>" . $title . " " . renderNotification(def($page, "notification_count", 0)) . "</a>
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
