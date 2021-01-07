<?php

function renderPageItem($page)
{
    $arrow_btn = "";
    if (isset($page["sub"])) {
        $arrow_btn = "<div class='btn transparent expand_arrow' onclick='expandMenu($(this).parent().next(),$(this).parent(),null,{single:true})'><i class='fas fa-chevron-right'></i></div>";
    }

    $title = "";
    $hidden = "";
    if (isset($page["title"])) {
        $title = $page["title"];
    } else {
        $hidden = "hidden";
    }

    echo "<div class='menu_item freeze_before_load $hidden'>
            <a href='" . STATIC_URLS["ADMIN"] . $page['url'] . "'>" . $title . " " . renderNotification($page['notification_count']) . "</a>
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
