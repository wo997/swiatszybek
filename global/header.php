<header class="page-header">
    <div class="header-top">
        <a href="/" class="logo-wrapper">
            <img class="logo logo-default" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>
        </a>

        <div class="main-search-wrapper case-desktop">
            <label for="main_search" class="glue_children any-search-wrapper">
                <input type="text" id="main_search" class="field inline" placeholder="Wpisz nazwę produktu">
                <button class="btn primary" onclick="btnSearchProducts()">
                    <img class="search-icon" src="/src/img/search_icon.svg">
                </button>
            </label>
            <div class="search-results"></div>
        </div>

        <div class="nav-wrapper">
            <div class="mobile-main-search-wrapper case-mobile headerbtn">
                <div onclick='showModal("mainSearch", {source:this});setTimeout(()=>{$(".main-search-wrapper label").click()},200)'>
                    <img class="search-icon" src="/src/img/search_icon.svg">
                </div>
            </div>
            <div class="user-wrapper">
                <?php if (User::getCurrent()->isLoggedIn()) : ?>
                    <a href="/moje-konto" class="headerbtn">
                        <img class="user-icon" src="/src/img/user_icon.svg">
                    </a>
                    <div class="user-menu">
                        <div class="username">
                            <?php
                            if (User::getCurrent()->data["type"] == 'google') echo '<img src="/img/google.png" style="width: 15px;vertical-align: sub;"> ';
                            if (User::getCurrent()->data["type"] == 'facebook') echo '<i class="fab fa-facebook-square" style="font-size: 15px;color: #3b5998;"></i> ';
                            echo User::getCurrent()->getDisplayName();
                            ?>
                        </div>
                        <?php if (User::getCurrent()->priveleges["backend_access"]) : ?>
                            <a class="admin border-bottom border-top menu_item" href="<?= Request::$static_urls["ADMIN"] ?>zamowienia"> <i class="fas fa-user-cog"></i> Panel administratora</a>
                        <?php endif ?>
                        <a class="menu_item" href="/moje-konto"> <i class="fas fa-box"></i> Moje zamówienia</a>
                        <a class="menu_item" href="/moje-konto/dane-uzytkownika"> <i class="fas fa-address-book"></i> Dane użytkownika</a>
                        <?php if (User::getCurrent() == 'regular') : ?>
                            <a class="menu_item" href="/moje-konto/resetowanie-hasla"> <i class="fas fa-unlock-alt"></i> Zmiana hasła </a>
                        <?php endif ?>
                        <a class="menu_item border-top" onclick="return logout()"> <i class="fa fa-sign-out-alt" style="vertical-align: middle;"></i> Wyloguj się </a>
                    </div>
                <?php else : ?>
                    <a onclick="showModal('loginForm',{source:this});" class="headerbtn">
                        <div>
                            <span class="case-desktop">Zaloguj się </span>
                            <img class="user-icon" src="/src/img/user_icon.svg">
                        </div>
                    </a>
                <?php endif ?>
            </div>
            <?php if (User::getCurrent()->isLoggedIn()) : ?>
                <div class="headerbtn case-desktop">
                    <img class="heart-icon" src="/src/img/heart_icon.svg">
                </div>
            <?php endif ?>
            <div class="last_viewed_products_wrapper headerbtn case-desktop">
                <img class="product-history-icon" src="/src/img/product_history_icon.svg">
                <div class="header_product_list headerbtn_hover_content">
                    <div class='case_last_viewed_products_empty expand_y'>
                        <div style='text-align:center;margin:2em 0'>Brak ostatnio<br>przeglądanych produktów</div>
                    </div>
                    <div class='case_last_viewed_products_not_empty'>
                        <h3 style='text-align:center;margin:0.3em 0;font-weight:600'>Ostatnio przeglądane</h3>
                        <hr>
                    </div>
                    <div class='scroll-panel scroll-shadow scroll-padding last_viewed_products_wrapper smooth-scrollbar'>
                        <div class="last_viewed_products"></div>
                    </div>
                </div>
            </div>
            <div class="basket-wrapper headerbtn">
                <div class="basket-btn">
                    <!--<span class="case-desktop">Koszyk</span>-->
                    <div class="basket-icon-wrapper">
                        <img class="basket-icon" src="/src/img/basket_icon.svg">
                        <div class="basket_item_count"></div>
                    </div>
                </div>
                <div class="nav_basket_container header_product_list headerbtn_hover_content">
                    <div class='case_basket_empty expand_y'>
                        <div style='text-align:center;margin:2em 0'>Twój koszyk jest pusty!</div>
                    </div>
                    <div class='case_basket_not_empty expand_y'>
                        <h3 style='text-align:center;margin:0.3em 0;font-weight:600;'>Koszyk</h3>
                        <hr>
                        <div class='scroll-panel scroll-shadow scroll-padding header_basket_content_wrapper smooth-scrollbar'>
                            <div class='header_basket_content'></div>
                        </div>
                        <hr>
                        <div class='nav_basket_summary'>
                            <div style='text-align:center;padding:5px;font-size:1.1em'>
                                Wartość koszyka:
                                <span class="total_basket_cost pln"></span>
                            </div>
                            <button class="btn primary medium fill gotobuy" onclick="window.location='/zakup';">
                                Przejdź do kasy
                                <i class="fa fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class='case-mobile headerbtn' onclick='showModal("mainMenu", {source:this})'>
                <img class="menu-icon" src="/src/img/menu_icon.svg">
            </div>
        </div>
    </div>

    <nav class="navigation">
        <?php
        function traverseMenu($parent_id = -1, $level = 0)
        {
            $categories = DB::fetchArr("SELECT product_category_id, name FROM product_category WHERE parent_product_category_id = $parent_id ORDER BY pos ASC");
            $html = "<ul>";
            foreach ($categories as $category) {
                $html .= "<ol><a>" . $category["name"] . traverseMenu($category["product_category_id"], $level + 1) . "</ol>";
            }
            $html .= "</ul>";
            return $html;
        }
        echo traverseMenu();
        ?>
    </nav>
</header>

<div class="header-height"></div>