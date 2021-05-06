<div class="cart_wrapper headerbtn gray_hover">
    <div class="basket_icon_wrapper">
        <img class="basket_icon" src="/src/img/basket_icon.svg">
        <div class="cart_product_count">0</div>
    </div>
    <div class="cart_menu headerbtn_menu">
        <p class="menu_header">Twój koszyk</p>
        <hr>
        <div class="case_cart_empty expand_y">
            <div style="margin: 2em 0;text-align: center;">Twój koszyk jest pusty!</div>
        </div>
        <div class="case_cart_not_empty expand_y">
            <div class="scroll_panel scroll_shadow scroll_padding smooth_scrollbar">
                <cart-products-comp class="all_products"></cart-products-comp>
            </div>
            <div class="cart_summary">
                <div class="semi_bold medium">
                    Suma:
                    <span class="cart_products_price pln"></span>
                </div>
                <a class="btn primary go_to_buy_btn" href="/kup-teraz">
                    Przejdź do kasy
                    <i class="fa fa-chevron-right"></i>
                </a>
            </div>
        </div>
    </div>
</div>