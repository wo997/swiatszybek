<div class="basket_wrapper headerbtn gray_hover">
    <div class="basket_icon_wrapper">
        <img class="basket_icon" src="/src/img/basket_icon.svg">
        <div class="basket_item_count"></div>
    </div>
    <div class="basket_menu headerbtn_menu">
        <p class="menu_header">Koszyk</p>
        <hr>
        <div class="case_basket_empty expand_y">
            <div style="margin: 2em 0;text-align: center;">Twój koszyk jest pusty!</div>
        </div>
        <div class="case_basket_not_empty expand_y">
            <div class='scroll_panel scroll_shadow scroll_padding basket_list_wrapper smooth_scrollbar'>
                <cart-products-comp class="all_products"></cart-products-comp>
            </div>
            <div class="basket_summary">
                <div style='text-align:center;padding:5px;font-weight:600'>
                    Wartość koszyka:
                    <span class="total_basket_cost pln bold">250 zł</span>
                </div>
                <a class="btn primary go_to_buy_btn" href="/zakup">
                    Przejdź do kasy
                    <i class="fa fa-chevron-right"></i>
                </a>
            </div>
        </div>
    </div>
</div>