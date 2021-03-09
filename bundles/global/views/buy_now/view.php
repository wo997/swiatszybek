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
                    <span class="cart_products_price pln"></span>
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

        <div class="expand_y choosen_account">
            <div class="label big first">Wybór konta</div>

            <p class="semi-bold">Zalety korzystania z konta LSIT.pl</p>
            <p>- Przeglądaj historię zamówień</p>
            <p>- Zapisz swoje adresy</p>
            <p>- Możesz wziąć udział w programie partnerskim</p>

            <br>

            <div style="max-width: 350px;">
                <div style="display:flex">
                    <button class="btn primary fill" style="margin-right:10px;" onclick="showModal(`loginForm`,{source:this});hideParentModal(this);">
                        Zaloguj się <i class='fas fa-user'></i>
                    </button>
                    <a href="/rejestracja" class="btn primary fill"> Rejestracja <i class="fa fa-user-plus"></i> </a>
                </div>

                <button class="btn primary fill buy_without_registration" style="margin-top:10px;">
                    Zakupy bez rejestracji <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <div class="expand_y animate_hidden hidden case_choosen_account">
            <div class="label big first your_address_label">Twój adres</div>
            <address-comp class="main_address"></address-comp>

            <div class="label big">Dostawa</div>
            <div class="radio_group boxes columns_2 hide_checks delivery">
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

        <div class="expand_y animate_hidden hidden case_courier">
            <div class="label big">Adres wysyłki</div>

            <div class="checkbox_area">
                <p-checkbox class="courier_address_different"></p-checkbox>
                <span>Chcę użyć innego adresu do wysyłki</span>
            </div>

            <div class="expand_y animate_hidden hidden case_courier_address_different">
                <address-comp class="courier_address"></address-comp>
            </div>
        </div>

        <div class="expand_y animate_hidden hidden case_parcel_locker">
            <div class="label big">Paczkomat</div>

        </div>

        <div class="expand_y animate_hidden hidden case_form_filled">
            <div class="label big">Potwierdzenie</div>

            <div class="checkbox_area">
                <p-checkbox class="square"></p-checkbox>
                <span>Akceptuję regulamin</span>
            </div>

            <button class="btn primary medium fill space_top">Potwierdzam zamówienie</button>

            <div style="margin-top: 15px;">Danych zamówienia nie będzie można już zmienić bez kontaktu z naszym działem obslugi klienta.</div>
            <div style="margin-top: 15px;">W następnym kroku dokonasz płatności (<span class="cart_total_price pln"></span>) za zamówienie jedną z poniższych metod:</div>
            Przelew Bankowy<br>
            bla<br>
            bla<br>
            bla
        </div>
    </div>
</div>

<div style="height: 70px"></div>

<?php include "bundles/global/templates/default.php"; ?>