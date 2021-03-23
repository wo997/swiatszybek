<?php //route[/kup-teraz]

if (empty(User::getCurrent()->cart->getProducts())) {
    Request::redirect("/");
}

?>

<?php startSection("head_content"); ?>

<title>Kup teraz</title>

<script>
    <?= useUECountriesOptionsInJS() ?>
</script>

<script async src="https://geowidget.easypack24.net/js/sdk-for-javascript.js"></script>
<link rel="stylesheet" href="https://geowidget.easypack24.net/css/easypack.css" />

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

        <div class="expand_y choosen_account <?= User::getCurrent()->isLoggedIn() ? "hidden animate_hidden" : "" ?>">
            <div class="label big first">Wybór konta</div>

            <p class="semi_bold">Zalety korzystania z konta LSIT.pl</p>
            <p>- Przeglądaj historię zamówień</p>
            <p>- Zapisz swoje adresy</p>
            <p>- Możesz wziąć udział w programie partnerskim</p>

            <br>

            <div class="account_buttons">
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

        <div class="expand_y case_choosen_account <?= !User::getCurrent()->isLoggedIn() ? "hidden animate_hidden" : "" ?>">
            <div class="label big first your_address_label">Dane kontaktowe</div>
            <address-comp class="main_address"></address-comp>

            <div class="label big">Dostawa</div>
            <div class="radio_group boxes big_boxes columns_3 hide_checks delivery">
                <div class="checkbox_area box">
                    <div>
                        <p-checkbox data-value="courier"></p-checkbox>
                        <span class="semi_bold">Kurier</span>
                        <span class="pln">20 zł</span>
                    </div>
                </div>
                <div class="checkbox_area box">
                    <div>
                        <p-checkbox data-value="parcel_locker"></p-checkbox>
                        <span class="semi_bold">Paczkomat</span>
                        <span class="pln">15 zł</span>
                    </div>
                </div>
                <div class="checkbox_area box">
                    <div>
                        <p-checkbox data-value="in_person"></p-checkbox>
                        <span class="semi_bold">Odbiór osobisty</span>
                        <span class="pln">0 zł</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="expand_y animate_hidden hidden case_courier">
            <div>
                <div class="label big">Adres wysyłki</div>

                <div class="checkbox_area">
                    <span class="semi_bold block" style="margin-bottom:5px">Chcę użyć innego adresu do wysyłki</span>

                    <div class="radio_group boxes hide_checks courier_address_different" data-number>
                        <div class="checkbox_area box">
                            <div>
                                <p-checkbox data-value="0"></p-checkbox>
                                <span class="semi_bold">Nie</span>
                            </div>
                        </div>
                        <div class="checkbox_area box">
                            <div>
                                <p-checkbox data-value="1"></p-checkbox>
                                <span class="semi_bold">Tak</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="expand_y animate_hidden hidden case_courier_address_different">
                    <address-comp class="courier_address optional_phone_email"></address-comp>
                </div>
            </div>
        </div>

        <div class="expand_y animate_hidden hidden case_parcel_locker">
            <div class="label big">Paczkomat</div>
            <div>
                <button class="btn primary pick_inpost_parcel_locker_btn">Wybierz paczkomat <i class="fas fa-map-marker-alt"></i></button>
                <div class="choosen_parcel_locker"> </div>
            </div>
        </div>

        <div class="expand_y animate_hidden hidden case_in_person">
            <div class="label big">Pojawi się możliwość utworzenia mapy punktów odbioru</div>
        </div>

        <div class="expand_y animate_hidden hidden case_form_filled">
            <div class="label big">Potwierdzenie zamówienia</div>

            <div class="label">Dodatkowe informacje do sprzedawcy <span class="optional_label"></span></div>
            <textarea class="field client_notes" style="min-height: 60px;max-height: 70px;"></textarea>

            <div class="label">Skorzystaj z szybkich i bezpiecznych płatności</div>
            <img src="/src/img/przelewy24-vector-logo.svg" style="width: 130px;margin: 10px 0 10px;">

            <div class="checkbox_area">
                <p-checkbox class="square accept_regulations"></p-checkbox>
                <span class="semi_bold">Akceptuję regulamin</span>
            </div>

            <button class="btn medium fill confirm_order pay_btn space_top">Płacę (<span class="cart_total_price"></span>)</button>

            <div style="margin-top: 15px;">Nastąpi przekierowanie na stronę płatności Przelewy24.</div>

            <div style="margin-top: 15px;">Danych zamówienia nie będzie można już zmienić bez kontaktu z naszym działem obslugi klienta.</div>
        </div>
    </div>
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

<?php include "bundles/global/templates/default.php"; ?>