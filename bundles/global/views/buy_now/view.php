<?php //route[/kup-teraz]

if (empty(User::getCurrent()->getCart()->getProducts())) {
    Request::redirect("/");
}

?>

<?php Templates::startSection("head"); ?>

<title>Kup teraz</title>

<script async src="https://geowidget.easypack24.net/js/sdk-for-javascript.js"></script>
<link rel="stylesheet" href="https://geowidget.easypack24.net/css/easypack.css" />

<?php Templates::startSection("body_content"); ?>

<div class="buy_now_container">
    <div class="buy_products_wrapper">
        <h1 class="buy_now_h1_mobile h1">Kup teraz</h1>

        <div class="label big mt0">
            Koszyk
            (<span class="cart_product_count"></span>)

            <button class="btn transparent empty_cart_btn small">Usuń wszystko</button>
        </div>

        <div class="products_cart_panel scroll_panel scroll_shadow">
            <cart-products-comp class="buy_products"></cart-products-comp>
        </div>

        <div class="cart_summary_wrapper">
            <button class="btn primary add_rebate_code_btn">Posiadam kod rabatowy</button>
            <div class="cart_summary">

                <div>
                    Produkty:
                    <span class="cart_products_price pln"></span>
                </div>
                <div>
                    Dostawa:
                    <span class="spinner_wrapper cart_delivery_price_wrapper">
                        <span class="cart_delivery_price pln">10 zł</span>
                        <span class="spinner overlay"></span>
                    </span>
                </div>
                <div class="rebate_codes_list"></div>
                <div class="big">
                    Suma:
                    <span class="cart_total_price pln"></span>
                </div>
            </div>
        </div>
    </div>

    <form class="buy_now_form" onsubmit="return false">
        <h1 class="buy_now_h1_desktop h1">Kup teraz</h1>

        <div class="expand_y choosen_account <?= User::getCurrent()->isLoggedIn() ? "hidden animate_hidden" : "" ?>">
            <div class="label big mt0">Wybór konta</div>

            <!-- <p class="semi_bold">Zalety korzystania z konta <?= getShopName() ?></p>
            <p>- Przeglądaj historię zamówień</p>
            <p>- Zapisz swoje adresy</p>
            <p>- Możesz wziąć udział w programie partnerskim</p> -->

            <div class="account_buttons">
                <div class="flex">
                    <button class="btn primary fill mr2" onclick="showModal(`loginForm`,{source:this});hideParentModal(this);">
                        Zaloguj się
                        <!-- <i class='fas fa-user'></i> -->
                    </button>
                    <a href="/rejestracja" class="btn primary fill">
                        Rejestracja
                        <!-- <i class="fa fa-user-plus"></i> -->
                    </a>
                </div>

                <button class="btn primary fill buy_without_registration mr2">
                    Zakupy bez rejestracji <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <div class="expand_y case_choosen_account <?= !User::getCurrent()->isLoggedIn() ? "hidden animate_hidden" : "" ?>">
            <div class="label big mt0 your_address_label">Dane kontaktowe</div>
            <address-comp class="main_address"></address-comp>

            <div class="label big">Dostawa</div>
            <div class="radio_group boxes big_boxes hide_checks delivery number" style="--columns:3" data-validate="">
                <div class="checkbox_area">
                    <div>
                        <p-checkbox data-value="1"></p-checkbox>
                        <span class="semi_bold">Kurier</span>
                        <span class="pln courier_prices"></span>
                    </div>
                </div>
                <div class="checkbox_area">
                    <div>
                        <p-checkbox data-value="2"></p-checkbox>
                        <span class="semi_bold">Paczkomat</span>
                        <span class="pln parcel_prices"></span>
                    </div>
                </div>
                <div class="checkbox_area">
                    <div>
                        <p-checkbox data-value="3"></p-checkbox>
                        <span class="semi_bold">Odbiór osobisty</span>
                        <span class="pln in_person_prices">0 zł</span>
                    </div>
                </div>
            </div>

            <div class="expand_y animate_hidden hidden case_courier_above">
                <div class="radio_group boxes big_boxes hide_checks payment_time pt4" style="--columns:2">
                    <div class="checkbox_area">
                        <div>
                            <p-checkbox data-value="prepayment"></p-checkbox>
                            <span class="semi_bold">Przedpłata</span>
                            <span class="pln">+ 0 zł</span>

                        </div>
                    </div>
                    <div class="checkbox_area">
                        <div>
                            <p-checkbox data-value="cod"></p-checkbox>
                            <span class="semi_bold">Za pobraniem</span>
                            <span class="pln">+ <span class="cod_fee"></span></span>

                        </div>
                    </div>
                </div>
            </div>

            <div class="radio_group carrier number mtf" data-validate=""></div>

            <div class="expand_y animate_hidden hidden case_courier">
                <div>
                    <div class="label big">Adres wysyłki</div>

                    <span class="label">Chcę użyć innego adresu do wysyłki</span>
                    <div class="radio_group boxes big_boxes hide_checks courier_address_different number" style="--columns:2">
                        <div class="checkbox_area">
                            <div>
                                <p-checkbox data-value="0"></p-checkbox>
                                <span class="semi_bold">Nie</span>
                            </div>
                        </div>
                        <div class="checkbox_area">
                            <div>
                                <p-checkbox data-value="1"></p-checkbox>
                                <span class="semi_bold">Tak</span>
                            </div>
                        </div>
                    </div>

                    <div class="expand_y animate_hidden hidden case_courier_address_different">
                        <address-comp class="courier_address optional_phone_email pt4"></address-comp>
                    </div>
                </div>
            </div>

            <div class="expand_y animate_hidden hidden case_parcel_locker">
                <div>
                    <button class="btn primary pick_inpost_parcel_locker_btn mtf">Wybierz paczkomat <i class="fas fa-map-marker-alt"></i></button>
                    <div class="choosen_parcel_locker"> </div>
                </div>
            </div>

            <div class="expand_y animate_hidden hidden case_in_person">
                <div class="in_person_map_wrapper"></div>
            </div>

            <div class="expand_y animate_hidden hidden case_form_filled">
                <div class="label big">Potwierdzenie zamówienia</div>

                <div class="label">Dodatkowe informacje dla sprzedawcy <span class="optional_label"></span></div>
                <textarea class="field client_notes" style="min-height: 60px;max-height: 70px;"></textarea>

                <div class="label">Skorzystaj z szybkich i bezpiecznych płatności</div>
                <img src="/src/img/przelewy24-vector-logo.svg" style="width: 130px;margin: 10px 0 10px;">

                <br>
                <div class="checkbox_area">
                    <p-checkbox class="square accept_regulations"></p-checkbox>
                    <span class="semi_bold">Akceptuję regulamin</span>
                </div>

                <button class="btn medium fill confirm_order pay_btn mtf">Płacę (<span class="cart_total_price"></span>)</button>

                <div style="margin-top: 15px;">Nastąpi przekierowanie na stronę płatności Przelewy24.</div>

                <!-- <div style="margin-top: 15px;">Danych zamówienia nie będzie można już zmienić bez kontaktu z naszym działem obslugi klienta.</div> -->
            </div>
        </div>
    </form>
</div>

<div style="height: 70px"></div>

<div id="InpostParcelLockerPicker" data-modal data-expand="large_mobile" data-dismissable>
    <div class="modal_body">
        <button class="close_modal_btn"><i class="fas fa-times"></i></button>
        <h3 class="modal_header">
            <i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>
            <span class="mobile">Paczkomat</span>
            <span class="desktop">Wybór paczkomatu</span>
        </h3>

        <div id="easypack-map"></div>
    </div>
</div>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadUECountries() ?>
    <?= preloadDeliveryTypes() ?>
</script>

<?php include "bundles/global/templates/default.php"; ?>