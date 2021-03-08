<?php //route[/kup-teraz]

if (empty(User::getCurrent()->cart->getProducts())) {
    Request::redirect("/");
}

?>

<?php startSection("head_content"); ?>

<title>Kup teraz</title>

<?php startSection("body_content"); ?>

<div class="buy_now_container">
    <h1 class="h1 mobile_view center">Kup teraz</h1>

    <div class="buy_products_wrapper">
        <div class="label big first">
            Koszyk
            (<span class="cart_product_count"></span>)
        </div>

        <div class="products_cart_panel scroll_panel scroll_shadow">
            <cart-products-comp class="buy_products"></cart-products-comp>
        </div>

        <div class="cart_summary_wrapper">
            <button class="btn primary add_rebate_code_btn">Posiadam kod rabatowy</button>
            <div class="cart_summary">

                <div>
                    Suma:
                    <span class="cart_total_price pln"></span>
                </div>
                <div>
                    Dostawa:
                    <span class="cart_delivery_price pln">10 zł</span>
                </div>
                <div class="rebate_codes_list"></div>
                <div class="big">
                    Do zapłaty:
                    <span class="cart_total_price pln"></span>
                </div>
            </div>
        </div>
    </div>

    <div class="buy_now_form">
        <h1 class="h1 desktop_view">Kup teraz</h1>

        <address-comp class="main_address"></address-comp>

        <div class="label big">Dostawa</div>
        <div class="radio_group boxes columns_2 hide_checks">
            <div class="checkbox_area box">
                <div>
                    <p-checkbox data-value="courier"></p-checkbox>
                    <span>Kurier</span>
                </div>
            </div>
            <div class="checkbox_area box">
                <div>
                    <p-checkbox data-value="parcel_locker"></p-checkbox>
                    <span>Paczkomat</span>
                </div>
            </div>
        </div>
    </div>
</div>

<div style="height: 70px"></div>

<?php include "bundles/global/templates/default.php"; ?>