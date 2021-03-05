<?php

function traverseMenu($parent_id = -1, $level = 0)
{
    $categories = DB::fetchArr("SELECT product_category_id, name, __category_path_json FROM product_category WHERE parent_product_category_id = $parent_id ORDER BY pos ASC");
    if (!$categories) {
        return "";
    }
    $html = "<ul class=\"level_$level\">";
    foreach ($categories as $category) {
        $html .= "<li><a href=\"" . getProductCategoryLink(json_decode($category["__category_path_json"], true)) . "\">" . $category["name"] . "</a>" .  traverseMenu($category["product_category_id"], $level + 1) . "</li>";
    }
    $html .= "</ul>";
    return $html;
}
?>

<header class="main menu_collapsed">
    <a href="/" class="logo-wrapper">
        <img class="logo logo-default" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>
    </a>

    <nav class="main_menu">
        <?= traverseMenu() ?>
    </nav>

    <div class="main_search_wrapper">
        <div class="glue_children search_wrapper">
            <input type="text" class="field" placeholder="Wyszukaj produkt">
            <button class="btn primary" onclick="searchAllProducts()">
                <img class="search_icon" src="/src/img/search_icon.svg">
            </button>
        </div>
        <div class="search-results"></div>
    </div>

    <div class="header_buttons">
        <button class="mobile_search_btn headerbtn gray_hover">
            <img class="search_icon" src="/src/img/search_icon.svg">
        </button>
        <?php
        if (User::getCurrent()->isLoggedIn()) {
            include "global/header_logged_in.php";
        } else {
            include "global/header_quest.php";
        }
        ?>
        <?php if (User::getCurrent()->isLoggedIn()) : ?>
            <div class="headerbtn gray_hover gray_hover wishlist_menu_btn">
                <img class="heart_icon" src="/src/img/heart_icon.svg">
            </div>
        <?php endif ?>
        <?php include "global/last_viewed_products.php"; ?>
        <?php include "global/header_basket.php"; ?>

        <div class='mobile_menu_btn headerbtn gray_hover gray_hover' onclick='showModal("mainMenu", {source:this})'>
            <img class="menu_icon" src="/src/img/menu_icon.svg">
        </div>
    </div>

</header>

<div class="header_height" style="height:71px"></div>