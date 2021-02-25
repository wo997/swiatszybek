<?php

function traverseMenu($parent_id = -1, $level = 0)
{
    $categories = DB::fetchArr("SELECT product_category_id, name FROM product_category WHERE parent_product_category_id = $parent_id ORDER BY pos ASC");
    $html = "<ul class=\"level_$level\">";
    foreach ($categories as $category) {
        $html .= "<li><a>" . $category["name"] . traverseMenu($category["product_category_id"], $level + 1) . "</a></li>";
    }
    $html .= "</ul>";
    return $html;
}
?>

<header>
    <a href="/" class="logo-wrapper">
        <img class="logo logo-default" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>
    </a>

    <div class="main-search-wrapper case_desktop">
        <div class="glue_children any-search-wrapper">
            <input type="text" class="field" placeholder="Wpisz nazwę produktu">
            <button class="btn primary" onclick="searchAllProducts()">
                <i class="fas fa-search"></i>
            </button>
        </div>
        <div class="search-results"></div>
    </div>

    <div class="header_buttons">
        <div class="mobile-main-search-wrapper case_mobile headerbtn">
            <div onclick='showModal("mainSearch", {source:this});setTimeout(()=>{$(".main-search-wrapper label").click()},200)'>
                <img class="search-icon" src="/src/img/search_icon.svg">
            </div>
        </div>
        <?php
        if (User::getCurrent()->isLoggedIn()) {
            include "global/header_logged_in.php";
        } else {
            include "global/header_quest.php";
        }
        ?>
        <?php if (User::getCurrent()->isLoggedIn()) : ?>
            <div class="headerbtn case_desktop">
                <img class="heart-icon" src="/src/img/heart_icon.svg">
            </div>
        <?php endif ?>
        <?php include "global/last_viewed_products.php"; ?>
        <?php include "global/header_basket.php"; ?>

        <div class='case_mobile headerbtn' onclick='showModal("mainMenu", {source:this})'>
            <img class="menu-icon" src="/src/img/menu_icon.svg">
        </div>
    </div>

</header>
<nav>
    <?= traverseMenu() ?>
</nav>

<div class="header-height"></div>