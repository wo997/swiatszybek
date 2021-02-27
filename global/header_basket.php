<div class="basket_wrapper headerbtn gray_hover">
    <div class="basket_icon_wrapper">
        <img class="basket_icon" src="/src/img/basket_icon.svg">
        <div class="basket_item_count">3</div>
    </div>
    <div class="nav_basket_container header_product_list headerbtn_menu">
        <div class='case_basket_empty expand_y'>
            <div>Twój koszyk jest pusty!</div>
        </div>
        <div class='case_basket_not_empty expand_y'>
            <h3 style='text-align:center;margin:0.3em 0;font-weight:600;'>Koszyk</h3>
            <hr>
            <div class='scroll_panel scroll_shadow scroll-padding header_basket_content_wrapper smooth_scrollbar'>
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