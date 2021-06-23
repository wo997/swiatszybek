<?php

$traverseProductCategories = function ($parent_id = -1, $level = 0) use (&$traverseProductCategories) {
    $categories = DB::fetchArr("SELECT product_category_id, name, __category_path_json FROM product_category WHERE parent_product_category_id = $parent_id ORDER BY pos ASC");
    if (!$categories) {
        return "";
    }
    $html = "<ul class=\"level_$level\">";
    foreach ($categories as $category) {
        $html .= "<li><a href=\"" . getProductCategoryLink(json_decode($category["__category_path_json"], true)) . "\">" . $category["name"] . "</a>" .  $traverseProductCategories($category["product_category_id"], $level + 1) . "</li>";
    }
    $html .= "</ul>";
    return $html;
};

$traverseMenu = function ($parent_id = -1, $level = 0) use (&$traverseMenu, &$traverseProductCategories) {
    $menus = DB::fetchArr("SELECT menu_id, name, link_what, link_what_id, url FROM menu WHERE parent_menu_id = $parent_id ORDER BY pos ASC");
    if (!$menus) {
        return "";
    }
    $html = "<ul class=\"level_$level\">";
    foreach ($menus as $menu) {
        $traverse_result = $traverseMenu($menu["menu_id"], $level + 1);
        if ($menu["link_what"] === "product_category") {
            $__category_path_json = DB::fetchVal("SELECT __category_path_json FROM product_category WHERE product_category_id = " . $menu["link_what_id"]);
            $menu["url"] = getProductCategoryLink(json_decode($__category_path_json, true));
            if (!$traverse_result) {
                $traverse_result = $traverseProductCategories($menu["link_what_id"], $level + 1);
            }
        } else if ($menu["link_what"] === "general_product") {
            $general_product_name = DB::fetchVal("SELECT name FROM general_product WHERE general_product_id = " . $menu["link_what_id"]);
            $menu["url"] = getProductLink($menu["link_what_id"], $general_product_name);
        } else if ($menu["link_what"] === "page") {
            $menu["url"] = "/" . DB::fetchVal("SELECT url FROM page WHERE page_id = " . $menu["link_what_id"]);
        }
        $html .= "<li><a href=\"" . $menu["url"] . "\">" . $menu["name"] . "</a>" .  $traverse_result . "</li>";
    }
    $html .= "</ul>";
    return $html;
};
?>

<a href="/" class="logo_wrapper">
    <img class="logo" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>
</a>

<nav class="main_menu">
    <?= $traverseMenu() ?>
</nav>

<div class="main_search_wrapper">
    <div class="glue_children search_wrapper">
        <input type="text" class="field focus_inside" placeholder="Wyszukaj produkt">
        <button class="btn primary spinner_wrapper" onclick="searchAllProducts()">
            <img class="search_icon" src="/src/img/search_icon.svg">
            <div class="spinner overlay white"></div>
        </button>
    </div>
    <div class="search_results"></div>
</div>

<div class="header_buttons">
    <button class="mobile_search_btn headerbtn gray_hover">
        <img class="search_icon" src="/src/img/search_icon.svg">
    </button>
    <?php
    if (User::getCurrent()->isLoggedIn()) {
        include "bundles/global/templates/parts/header/header_logged_in.php";
    } else {
        include "bundles/global/templates/parts/header/header_guest.php";
    }
    ?>
    <?php if (User::getCurrent()->isLoggedIn()) : ?>
        <!-- <div class="headerbtn gray_hover wishlist_menu_btn">
                <img class="heart_icon" src="/src/img/heart_icon.svg">
            </div> -->
    <?php endif ?>
    <?php include "bundles/global/templates/parts/header/last_viewed_products.php"; ?>
    <?php include "bundles/global/templates/parts/header/header_basket.php"; ?>

    <div class='mobile_menu_btn headerbtn gray_hover' onclick='showModal("mainMenu", {source:this})'>
        <img class="menu_icon" src="/src/img/menu_icon.svg">
    </div>
</div>