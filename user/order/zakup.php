<?php //route[zakup]

$progressBarCounter = 0;

// TODO: FIX DEFAULT VALUES - przy insercie do bazy
// TODO: Walidacja na regulamin
// TODO: Walidacja na NIP i ZIP (wyliczanie poprawnego?)
// TODO: Poprawki animacji
// TODO: Zmiana pozycji przycisków - menu 2 - pod koszykiem
// ....
$zamowienie_data = [
    "imie" => "",
    "nazwisko" => "",
    "email" => "",
    "telefon" => "",
    "firma" => "",
    "nip" => "",

    "kraj" => "Polska",
    "miejscowosc" => "",
    "kod_pocztowy" => "",
    "ulica" => "",
    "nr_domu" => "",
    "nr_lokalu" => "",

    "imie_dostawa" => "",
    "nazwisko_dostawa" => "",
    "firma_dostawa" => "",

    "kraj_dostawa" => "Polska",
    "miejscowosc_dostawa" => "",
    "kod_pocztowy_dostawa" => "",
    "ulica_dostawa" => "",
    "nr_domu_dostawa" => "",
    "nr_lokalu_dostawa" => "",

    "buyer_type" => 'p',
    "dostawa" => "k",

    "cache_basket" => "",
    "track" => "",
    "notes" => "",
    "uwagi" => "",
    "rebate_generated" => false
];

if ($app["user"]["id"]) {
    //$user_data = fetchRow("SELECT imie, nazwisko, email, telefon, firma, nip, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu FROM `users` WHERE user_id = ".intval($app["user"]["id"]));
    $user_data = fetchRow("SELECT * FROM users WHERE user_id = " . intval($app["user"]["id"]));

    // rewrite empty
    foreach ($user_data as $key => $value) {
        if (!trim($value)) continue;

        if (isset($zamowienie_data[$key])) {
            $zamowienie_data[$key] = $value;
        }
    }
}

$zamowienie_link = urlParam(1);
$impersonate = 0;
if (strlen($zamowienie_link) > 5) {
    // $zamowienie_data = fetchRow("SELECT zamowienie_id, user_id, user_type, basket, koszt, zlozono, oplacono, nip, status, imie, nazwisko, email, telefon, firma, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu, dostawa, uwagi, koszt_dostawy, session_id, rabat, kod_pocztowy_z, miejscowosc_z, kraj_z, ulica_z, nr_domu_z, nr_lokalu_z,  imie_d, nazwisko_d, firma_d, buyer_type FROM zamowienia LEFT JOIN users USING (user_id) WHERE link = ?", $zamowienie_link);
    $zamowienie_data = fetchRow("SELECT *, z.cache_basket, z.imie, z.nazwisko, z.email, z.telefon, z.nip, z.kraj, z.miejscowosc, z.ulica, z.kod_pocztowy, z.nr_domu, z.nr_lokalu FROM zamowienia z LEFT JOIN users USING (user_id) WHERE link = ?", [$zamowienie_link]);

    $basket_swap = json_decode($zamowienie_data["cache_basket"], true);
    $basket = [];
    if ($basket_swap) {
        foreach ($basket_swap as $b) {
            $basket[] = [
                "variant_id" => $b['variant_id'],
                "quantity" => $b['quantity']
            ];
        }
    }

    setBasketData($basket);
    prepareBasketData();
    // TODO: check if that even works, maybe a reload is a better idea here? simple af

    unset($_SESSION["kod"]);
    $_SESSION["rabat"] = $zamowienie_data["rabat"];
    $_SESSION["user_id_impersonate"] = nonull($zamowienie_data, "user_id", null);
    $_SESSION["user_type_impersonate"] = nonull($zamowienie_data, "user_type", null);
    $impersonate = 1;
} else {
}


if (empty($app["user"]["basket"]["variants"]) && !isset($_GET['produkt'])) {
    header("Location: /");
    die;
}

?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <title>Zakup</title>
    <script async src="/src/inpost_map.js"></script>
    <link rel="stylesheet" href="/src/inpost_map.css?a=2" />
    <?php include "global/includes.php"; ?>
    <link href="/builds/order.css?v=<?= CSS_RELEASE ?>" rel="stylesheet">
    <style>

    </style>
    <script>
        window.addEventListener("DOMContentLoaded", function() {
            window.form = $("#zakupForm");
            window.form.findAll("[name]").forEach(input => {
                window.form[input.name] = input;
            });

            setFormData(<?= json_encode($zamowienie_data) ?>, window.form);
            loadFormFromLocalStorage();
            clearAllErrors(".main-container");

            if (RABAT > 0) hasKodRabatowy({
                kwota: RABAT,
                type: RABAT_TYPE
            });

            window.form.addEventListener('keypress', function(e) {
                if (e.key == 'Enter' && e.target.tagName != "TEXTAREA") {
                    e.preventDefault();
                    return false;
                }
            });

            $$(".progress-item[data-id]").forEach(e => {
                e.addEventListener("click", () => {
                    showMenu(e.getAttribute("data-id"), 'kontakt');
                });
            });

            $$(`[name*="_kurier"]`).forEach(e => {
                e.addEventListener("change", () => {
                    var name = e.getAttribute("name").replace("_kurier", "_dostawa");
                    var input = form.find(`input[name="${name}"]`);
                    if (input) {
                        setValue(input, e.value);
                    }
                });
            });

            $$(`[name*="_kurier"]`).forEach(e => {
                e.addEventListener("change", () => {
                    var name = e.getAttribute("name").replace("_kurier", "_dostawa");
                    var input = form.find(`input[name="${name}"]`);
                    if (input) {
                        setValue(input, e.value);
                    }
                });
            });

            $(`[name="other_address"]`).addEventListener("click", (e) => {
                expand($(`#shipping_details`), e.target.checked);
                if(e.target.checked){
                    clearAddress();
                }
            });

            $(`[name="want_invoice"]`).addEventListener("click", (e) => {
                expand($(`.nip`), e.target.checked);
                expand($(`.company`), e.target.checked);
                setBuyerFromInput(e.target.checked);
            });
        });

        function isFormValid() {
            return validateForm($("#menu" + currentMenu));
        }

        function copyAddress() {
            setValue(form.imie_kurier, form.imie.value);
            setValue(form.nazwisko_kurier, form.nazwisko.value);
            setValue(form.firma_kurier, form.firma.value);

            setValue(form.kraj_kurier, form.kraj.value);
            setValue(form.kod_pocztowy_kurier, form.kod_pocztowy.value);
            setValue(form.miejscowosc_kurier, form.miejscowosc.value);
            setValue(form.ulica_kurier, form.ulica.value);
            setValue(form.nr_domu_kurier, form.nr_domu.value);
            setValue(form.nr_lokalu_kurier, form.nr_lokalu.value);
        }

        function clearAddress() {
            setValue(form.imie_kurier, '');
            setValue(form.nazwisko_kurier, '');
            setValue(form.firma_kurier, '');

            setValue(form.kraj_kurier, '');
            setValue(form.kod_pocztowy_kurier,  '');
            setValue(form.miejscowosc_kurier,  '');
            setValue(form.ulica_kurier, '');
            setValue(form.nr_domu_kurier, '');
            setValue(form.nr_lokalu_kurier, '');
        }

        var currentMenu = 1;
        var wait = false;

        function showMenu(i, scroll) {
            if (i - currentMenu > 1) {
                i = +currentMenu + 1;
            }
            if (i - currentMenu < -1) {
                i = +currentMenu - 1;
            }

            <?php if ($app["user"]["id"]) { ?>
                // if (i == 2) i = 2 * i - currentMenu;
            <?php } ?>


            if (wait || currentMenu == i) return;
            
            if(i == 3 && !$('[name="other_address"]').checked){
                console.log('copy');
                copyAddress();
            }

            if (i > currentMenu && isFormValid() == false) return;

            var wasMenu = currentMenu;
            currentMenu = i;

            wait = true;
            var was = $("#menu" + wasMenu);
            var wasBox = $("#menu" + wasMenu + '-steps');
            var wasTitle = $("#menu" + wasMenu + '-steps-title');
            var now = $("#menu" + i);
            var nowBox = $("#menu" + i + '-steps');
            var nowTitle = $("#menu" + i + '-steps-title');
            
            $$(".menu").forEach(menu => {
                menu.classList.remove("showNow");
            });

            $(".stepHolder").classList.remove('step-' + wasMenu);
            $(".stepHolder").classList.add('step-' + i);
            now.style.display = "flex";
            now.style.height = "";
            was.classList.remove('menu-scroll');
            nowBox.classList.add("showNow");
            wasBox.classList.remove("showNow");
            nowTitle.classList.add("showNow");
            wasTitle.classList.remove("showNow");
            
            expand($(`.stepContent`), false, {duration: 500});
            setTimeout(function() {
                now.classList.add("showNow");
                wait = false;
                nowTitle.style.display = "block";
                wasTitle.style.display = "none";

                setTimeout(function() {
                    var params = {};
                    if (window.innerWidth >= 800) {
                        params.offset = -50;
                    }

                    setCustomHeights();
                    var view = $(`[data-view='${scroll}`);
                    if (!view) {
                        view = now.find(`*`);
                    }
                    if (view) {
                        scrollIntoView(view, params);
                    }
                    
                }, 10);

                setTimeout(function(){
                    was.style.display = "none";
                    nowBox.style.display = "block";
                    wasBox.style.display = "none";
                    if(i == 2)now.classList.add('menu-scroll');
                    expand($(`.stepContent`), true, {duration: 1000});
                },500);
            }, 200);

            if (i == 1) {
                setTimeout(function() {
                    $(".variant_list_holder_1").appendChild($(".variant_list_full"));
                }, 300);
            } else if (i == 2) {
                setTimeout(function() {
                    $(".variant_list_holder_2").appendChild($(".variant_list_full"));
                }, 600);
                setTimeout(function(){
                    now.classList.add('menu-scroll');
                },5000)
            }
            else if (i == 3) {
                var daneKontaktoweInfo = "";
                if (BUYER_TYPE == 'p') {
                    daneKontaktoweInfo = form.imie.value + " " + form.nazwisko.value;
                } else {
                    daneKontaktoweInfo = form.firma.value + "<br>NIP:&nbsp;" + form.nip.value;
                }
                daneKontaktoweInfo += "<br>" + form.telefon.value + "<br>" + form.email.value;

                daneKontaktoweInfo += '<div style="height: 7px;"></div>' + form.kod_pocztowy.value + " " + form.miejscowosc.value + ", " + form.kraj.value + "<br>" + form.ulica.value + " " + form.nr_domu.value + (form.nr_lokalu.value ? "/" : "") + form.nr_lokalu.value;

                $("#daneKontaktoweInfo").innerHTML = daneKontaktoweInfo;

                if ($("#dostawaRodzaj").innerHTML == "Paczkomat") {
                    $("#adresInfo").innerHTML = $("#paczkomatAdres").innerHTML;

                    DELIVERY_COST = <?= config('paczkomat_cena', 0) ?>;
                } else if ($("#dostawaRodzaj").innerHTML == "Kurier") {
                    /*form.kraj_dostawa.value = form.kraj.value;
                    form.miejscowosc_dostawa.value = form.miejscowosc.value;
                    form.kod_pocztowy_dostawa.value = form.kod_pocztowy.value;
                    form.ulica_dostawa.value = form.ulica.value;
                    form.nr_domu_dostawa.value = form.nr_domu.value;
                    form.nr_lokalu_dostawa.value = form.nr_lokalu.value;*/

                    DELIVERY_COST = <?= config('kurier_cena', 0) ?>;
                } else {
                    DELIVERY_COST = 0;
                }

                var adresInfo = "";

                if ($("#dostawaRodzaj").innerHTML == "Kurier") {
                    adresInfo += form.imie_dostawa.value + " " + form.nazwisko_dostawa.value + (form.firma_dostawa.value == '' ? '' : "<br>" + form.firma_dostawa.value) +
                        '<span style="height: 7px;display:block"></span>'
                }

                adresInfo += (form.paczkomat.value ? ("Paczkomat " + form.paczkomat.value + "<br>") : "") +
                    form.ulica_dostawa.value + " " + form.nr_domu_dostawa.value + (form.nr_lokalu_dostawa.value ? "/" : "") + form.nr_lokalu_dostawa.value +
                    "<br>" + form.kod_pocztowy_dostawa.value + " " + form.miejscowosc_dostawa.value + ", " + form.kraj_dostawa.value;

                $("#adresInfo").innerHTML = adresInfo;

                var forma_zaplaty = "po";
                if ($("#p24").checked) {
                    forma_zaplaty = "24";
                }

                form.forma_zaplaty.value = forma_zaplaty;

                $("#submit_text").innerHTML = forma_zaplaty == "po" ? "POTWIERDZAM ZAMÓWIENIE" : "ZAMAWIAM I PŁACĘ";

                $("#zaplataInfo").innerHTML = $("#forma_" + forma_zaplaty).innerHTML.replace(/<input.*>/, "");

                $("#koszt_dostawy_label").innerHTML = DELIVERY_COST + " zł";

                if ($("#dostawaRodzaj").innerHTML == "Kurier") {
                    $("#estimatedDelivery").style.display = "block";
                } else {
                    $("#estimatedDelivery").style.display = "none";
                }

                updateTotalCost();
            }
        }

        var firstPaczkomat = true;

        function showPaczkomatPicker() {
            toggleBodyScroll(false);
            if (firstPaczkomat) {
                window.easyPackAsyncInit = function() {
                    easyPack.init({});
                    var map = easyPack.mapWidget('easypack-map', function(point) {
                        hidePaczkomatPicker();
                        selectDostawa("paczkomat-option", false);

                        setFormData({
                            paczkomat: point.name,
                            kraj_dostawa: "Polska",
                            miejscowosc_dostawa: point.address_details.city,
                            kod_pocztowy_dostawa: point.address_details.post_code,
                            ulica_dostawa: point.address_details.street,
                            nr_domu_dostawa: point.address_details.building_number,
                            nr_lokalu_dostawa: ""
                        }, window.form);

                        $("#paczkomatAdres").innerHTML = "Paczkomat " + form.paczkomat.value + "<br>" + form.ulica_dostawa.value + " " + form.nr_domu_dostawa.value + "<br>" + form.kod_pocztowy_dostawa.value + " " + form.miejscowosc_dostawa.value + " Polska";

                        $("#dostawaRodzaj").innerHTML = "Paczkomat";
                        setValue($("#dostawaInput"), "p");
                    });
                };
                firstPaczkomat = false;
            }
            var picker = $('#paczkomat-picker');
            picker.style.display = "block";
            setTimeout(function() {
                picker.classList.add('paczkomat-picker-open');
            }, 0);
        }

        function expandOneDostawa(dostawa) {
            expand($("#casePaczkomat"), dostawa == "paczkomat");
            expand($("#caseKurier"), dostawa == "kurier");
            expand($("#caseOsobiscie"), dostawa == "osobiscie");
        }

        var BUYER_TYPE = '<?= $zamowienie_data["buyer_type"] ?>';

        function setBuyerFromInput(value) {
            if (value) {
                if (value == "p") {
                    $("#priv").checked = true;
                } else {
                    $("#comp").checked = true;
                }
            }
        }

        function hidePaczkomatPicker() {
            toggleBodyScroll(true);
            var picker = $('#paczkomat-picker');
            picker.classList.remove('paczkomat-picker-open');
            setTimeout(function() {
                picker.style.display = "none"
            }, 300);
        }

        function selectDostawaFromInput(value) {
            if (value == "k") {
                selectDostawa("kurier-option", false);
            } else if (value == "p") {
                selectDostawa("paczkomat-option", false);

                expandOneDostawa("paczkomat");

                setTimeout(() => {
                    $("#paczkomatAdres").innerHTML = "Paczkomat " + form.paczkomat.value + "<br>" + form.ulica_dostawa.value + " " + form.nr_domu_dostawa.value + "<br>" + form.kod_pocztowy_dostawa.value + " " + form.miejscowosc_dostawa.value + " Polska";
                }, 100);
            } else if (value == "o") {
                selectDostawa("osobiscie-option", false);
            }
        }

        function selectDostawa(id, user = true) {
            dostawaInput = "k"; // default

            if (id != 'paczkomat-option') {
                form.paczkomat.value = "";
            }

            if (id == 'kurier-option') {
                $("#dostawaRodzaj").innerHTML = "Kurier";
                dostawaInput = "k";

                expandOneDostawa("kurier");

                $$(`[name*="_kurier"]`).forEach(e => {
                    e.dispatchChange();
                });
            } else if (id == 'osobiscie-option') {
                setFormData({
                    kraj_dostawa: "Polska",
                    miejscowosc_dostawa: "Warszawa",
                    kod_pocztowy_dostawa: "01-460",
                    ulica_dostawa: "Górczewska",
                    nr_domu_dostawa: "216",
                    nr_lokalu_dostawa: ""
                }, window.form);

                $("#dostawaRodzaj").innerHTML = "Odbiór osobisty";
                dostawaInput = "o";

                expandOneDostawa("osobiscie");
            }

            var previous = $(".selectedDostawa");
            if (previous)
                previous.classList.remove("selectedDostawa");

            document.getElementById(id).classList.add("selectedDostawa");

            if (user) {
                setValue($("#dostawaInput"), dostawaInput);
            }

            if ($("#dostawaRodzaj").innerHTML == "Paczkomat") {
                $("#adresInfo").innerHTML = $("#paczkomatAdres").innerHTML;

                DELIVERY_COST = <?= config('paczkomat_cena', 0) ?>;
            } else if ($("#dostawaRodzaj").innerHTML == "Kurier") {
                /*form.kraj_dostawa.value = form.kraj.value;
                form.miejscowosc_dostawa.value = form.miejscowosc.value;
                form.kod_pocztowy_dostawa.value = form.kod_pocztowy.value;
                form.ulica_dostawa.value = form.ulica.value;
                form.nr_domu_dostawa.value = form.nr_domu.value;
                form.nr_lokalu_dostawa.value = form.nr_lokalu.value;*/

                DELIVERY_COST = <?= config('kurier_cena', 0) ?>;
            } else {
                DELIVERY_COST = 0;
            }
            $("#koszt_dostawy_label").innerHTML = DELIVERY_COST + " zł";
        }

        function aktywujKodRabatowy(action) {
            ajax('/validate_kod_rabatowy', {
                code: $("#kod_rabatowy").value,
                action: action
            }, (response) => {
                if (action == "remove") {
                    hasKodRabatowy(null);
                } else {
                    response = JSON.parse(response);
                    if (response.success) {
                        hasKodRabatowy(response);
                    } else {
                        $("#kod_rabatowy").style.borderColor = "red";
                        $("#kod_rabatowy_reason").innerHTML = response.error;
                    }
                }
            }, null);
        }

        var DELIVERY_COST = 0;

        var RABAT = <?= isset($_SESSION["rabat"]) ? $_SESSION["rabat"] : 0 ?>;
        var RABAT_TYPE = "<?= isset($_SESSION["rabat_type"]) ? $_SESSION["rabat_type"] : "static" ?>";

        function hasKodRabatowy(rabat) {
            if (rabat) {
                RABAT = rabat.kwota;
                RABAT_TYPE = rabat.type;
            } else {
                RABAT = 0;
                RABAT_TYPE = "static";
            }

            if (RABAT == 0) {
                expand($(`#kod_rabatowy_wrapper`), false);
                expand($(`#rabat_hide`), true);
            } else {
                $("#kod_rabatowy").style.borderColor = "";
                $("#kod_rabatowy_label").innerHTML = "-" + RABAT + (RABAT_TYPE == "static" ? "zł" : "%");
                expand($(`#kod_rabatowy_wrapper`), true);
                expand($(`#rabat_hide`), false);
            }

            updateTotalCost();
        }

        function updateTotalCost() {
            var t = $("#final-cost");
            t.innerHTML = (RABAT_TYPE == "static" ? (basket_data.total_basket_cost - RABAT) : Math.round(basket_data.total_basket_cost * (1 - 0.01 * RABAT))) + DELIVERY_COST;
        }

        function confirmOrder() {
            const zakupForm = $(`#zakupForm`);

            if (!isFormValid(zakupForm)) {
                return;
            }

            const params = getFormData(zakupForm);

            xhr({
                url: "/potwierdz_zamowienie",
                params,
            });
        }

        // just basket pls

        window.addEventListener("basket-change", (event) => {
            var res = event.detail.res;

            if (res.basket.length === 0) {
                $$("#zakupForm button, .hideifempty").forEach(e => {
                    e.style.opacity = "0.3";
                    e.style.pointerEvents = "none";
                });
            } else {
                $$("#zakupForm button, .hideifempty").forEach(e => {
                    e.style.opacity = "";
                    e.style.pointerEvents = "";
                });
            }

            showVariantChanges(res, $(`.variant_list_full`), zakup_basket_row_template, basket_data.basket);

            // TODO: rebate as a part of basket ;)
            updateTotalCost();
        });

        const zakup_basket_row_template = `
      <div class='expand_y'>
        <div class='product_row'>
          <div class='cl cl1'><img class='variant_image' data-height='1w'></div>
          <div class='cl cl2'><a class='link product_link variant_full_name'></a></div>
          <div class='pln cl cl3' style='font-weight:normal'><label>Cena:</label> <span class='variant_price'></span> zł</div>
          <div class='cl cl4'>
            <div class='qty-control glue-children'>
              <button class='btn subtle qty-btn remove' onclick='addVariantToBasket(this,-1)'>
                <i class='custom-minus'></i>
              </button>
              <span class='qty-label'></span>
              <button class='btn subtle qty-btn add' onclick='addVariantToBasket(this,1)'>
                <i class='custom-plus'></i>
              </button>
            </div>
          </div>
          <div class='cl cl5'><label>Suma:</label> <span class='pln variant_total_price'></span></div>
          <button class='cl cl6 fas fa-times remove-product-btn' onclick='addVariantToBasket(this,-100000);return false;'></button>
        </div>
      </div>
    `;
    </script>
</head>

<body>
    <?php include "global/header.php"; ?>

    <div id="paczkomat-picker">
        <div style="display: flex; flex-wrap: wrap; justify-content:space-between;height: 44px;">
            <h3 style="margin: 10px 0; text-align:center; flex-grow:1">Wybór paczkomatu</h3>
            <button id="closeBtn" onclick="hidePaczkomatPicker()">Zamknij <i class="fa fa-times"></i></button>
        </div>
        <div id="easypack-map"></div>
    </div>

    <div class="main-container mobileRow" id="zakupForm" style="margin: 50px 0;width: 100%;" data-form>
        
        <div style="margin: 0 auto;" class="content-holder">
            <div id="menu1" class="menu showNow step-1" style="max-width: 800px;">
                <div class="menu-holder">

                    <?php if (isset($_GET['produkt'])) : ?>
                        <h3 style="margin:20px;color:red;text-align:center">Niestety produkt został już wyprzedany!<br><span style="font-weight: normal;">Musisz zmienić zawartość koszyka</span></h3>
                    <?php endif ?>

                    <!--<div class="zamowienie adjustable-list"></div>-->

                    <div class="variant_list_holder_1">
                        <div class='variant_list_full'>
                            <div class='case_basket_empty expand_y'>
                                <h3 style='text-align:center;margin:2em 0'>Koszyk jest pusty!</h3>
                            </div>
                            <div class='header case_basket_not_empty'>
                                <div class="product_row">
                                    <div class="cl1">Produkt</div>
                                    <div class="cl2"></div>
                                    <div class="cl3">Cena</div>
                                    <div class="cl4">Ilość</div>
                                    <div class="cl5">Suma</div>
                                    <div class="cl6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="menu2" class="menu step-1" style="max-width: 900px; display:none;">
                <div class="menu-holder">
                    <h3 style="font-size: 26px;padding: 0 10px;margin: 0;" data-view="kontakt">Dane kontaktowe</h3>

                    <label class="checkbox-wrapper" style="padding: 10px 10px 0px;">
                        <input type="checkbox" name="want_invoice">
                        <div class="checkbox"></div>
                        Chcę otrzymać fakturę
                    </label>

                    <div class="mobileRow">
                        <div style="width:100%;padding: 10px 10px 20px;">
                            <div style="max-width: 550px;margin: 0 auto;" class="expand_y company hidden animate_hidden">
                                <div class="field-title">Nazwa firmy</div>
                                <input type="text" class="field" name="firma" autocomplete="organization" data-validate data-store>
                            </div>
                            <div style="max-width: 550px;margin: 0 auto;">
                                <div class="field-title">Imię</div>
                                <input type="text" class="field" name="imie" autocomplete="first-name" data-validate data-store>
                            </div>

                            <div style="max-width: 550px;margin: 0 auto;">
                                <div class="field-title">Adres e-mail</div>
                                <input type="text" class="field" name="email" autocomplete="email" data-validate="email" data-store>
                            </div>
                            <div style="max-width: 550px;margin: 0 auto;">
                                <div class="miejscowosc-picker-wrapper">
                                    <div class="field-title">Miejscowość</div>
                                    <input class="field miejscowosc-picker-target" type="text" name="miejscowosc" autocomplete="address-level2" placeholder=" " data-validate data-store>
                                    <div class="miejscowosc-picker-list"></div>
                                </div>
                            </div>
                            <div style="max-width: 550px;margin: 0 auto;">
                                <div class="field-title">Kraj</div>
                                <input type="text" class="field" name="kraj" data-validate data-store>
                            </div>
                            <div style="max-width: 550px;margin: 0 auto;">
                                <div class="field-title">Nr domu</div>
                                <input type="text" class="field" name="nr_domu" autocomplete="address-line2" data-validate data-store>
                            </div>
                        </div>
                        <div style="width:100%;padding: 10px 10px 20px;">
                            <div style="max-width: 550px;margin: 0 auto;" class="expand_y nip hidden animate_hidden">
                                <div class="field-title">NIP</div>
                                <input type="text" class="field" name="nip" data-validate="nip" data-store>
                            </div>
                            <div style="max-width: 550px;margin: 0 auto;">
                                <div class="field-title">Nazwisko</div>
                                <input type="text" class="field" name="nazwisko" autocomplete="family-name" data-validate data-store>
                            </div>
                            <div style="max-width: 550px;margin: 0 auto;">
                                <div class="field-title">Nr telefonu</div>
                                <input type="text" class="field" name="telefon" autocomplete="tel" data-validate data-store>
                            </div>
                            <div style="max-width: 550px;margin: 0 auto;">
                                <div class="field-title">Kod pocztowy</div>
                                <input type="text" class="field" name="kod_pocztowy" autocomplete="postal-code" onchange="kodPocztowyChange(this)" data-validate data-store>
                            </div>
                            <div style="max-width: 550px;margin: 0 auto;">
                                <div class="field-title">Ulica</div>
                                <input type="text" class="field" name="ulica" autocomplete="address-line1" data-validate data-store>
                            </div>
                            
                            <div style="max-width: 550px;margin: 0 auto;">
                                <div class="field-title">Nr lokalu</div>
                                <input type="text" class="field" name="nr_lokalu" autocomplete="address-line3" data-store>
                            </div>
                        </div>
                    </div>

                    <h3 style="font-size: 26px;padding: 10px;margin: 0;" data-view="kontakt">Dostawa</h3>
                    <div style="display: flex;">
                        <div class="dostawa" id="kurier-option" onclick="selectDostawa(this.id)">
                            <img src="/img/courier.png" style="width:25px"> <span>Kurier</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">+<?= config('kurier_cena', 0) ?> zł</span>
                        </div>

                        <div class="dostawa" id="paczkomat-option" onclick="showPaczkomatPicker()">
                            <img src="/img/inpost_logo.png" style="width:25px"> <span>Paczkomat</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">+<?= config('paczkomat_cena', 0) ?> zł</span>
                        </div>

                        <div class="dostawa" id="osobiscie-option" onclick="selectDostawa(this.id)">
                            <i class="fa fa-user" style="font-size: 13px;margin: 4px;"></i> <span>Odbiór osobisty</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">0 zł</span>
                            <input name="oddzial_id" value="0" type="hidden" data-store>
                        </div>
                    </div>

                    <input id="dostawaInput" name="dostawa" type="hidden" onchange="selectDostawaFromInput(this.value)" data-store />
                    <input name="paczkomat" type="hidden" data-store="paczkomat">

                    <div style="min-height: 120px;padding: 0 10px">
                        <div id="casePaczkomat" class="expand_y hidden animate_hidden" style="display: flex;flex-direction:column;justify-content:center;min-height: 100px;">
                            <h3 style="font-size: 20px;" data-view="adres">Dostawa do paczkomatu</h3>
                            <div style="display:flex;font-size:14px;line-height:1.3;">
                                <!-- TODO: Zastąpić paczuchę -->
                                <img src='/src/img/inpost_bot.svg' style="width: 70px; height: 70px; margin-right: 10px;">
                                <div id="paczkomatAdres">

                                </div>
                            </div>
                        </div>

                        <div id="caseKurier" class="expand_y hidden animate_hidden">
                            <h3 style="font-size: 20px;" data-view="adres">Adres dostawy</h3>

                            <!-- <button class="btn primary" onclick="copyAdres()" style="width:auto;margin:0 auto 10px;display:block"><i class="fa fa-copy"></i> Przepisz moje dane</button> -->
                            <label class="checkbox-wrapper">
                                <input type="checkbox" name="other_address">
                                <div class="checkbox"></div>
                                Adres dostawy inny podany
                            </label>

                            <div id="shipping_details" class="expand_y hidden animate_hidden">
                                <div class="field-title">Imię</div>
                                <input type="text" class="field" name="imie_kurier" autocomplete="first-name" data-validate data-store>

                                <div class="field-title">Nazwisko</div>
                                <input type="text" class="field" name="nazwisko_kurier" autocomplete="family-name" data-validate data-store>

                                <div class="field-title">Nazwa firmy <i style="font-size: 0.8em;color: #666;font-style: normal;">(opcjonalnie)</i></div>
                                <input type="text" class="field" name="firma_kurier" autocomplete="organization" data-store>

                                <div class="field-title">Kraj</div>
                                <input type="text" class="field" name="kraj_kurier" data-validate data-store>

                                <div class="miejscowosc-picker-wrapper">
                                    <div class="field-title">Kod pocztowy</div>
                                    <input type="text" class="field" name="kod_pocztowy_kurier" autocomplete="postal-code" onchange="kodPocztowyChange(this)" data-validate data-store>

                                    <div class="field-title">Miejscowość</div>
                                    <input class="field miejscowosc-picker-target" type="text" name="miejscowosc_kurier" autocomplete="address-level2" placeholder=" " data-validate data-store>
                                    <div class="miejscowosc-picker-list"></div>
                                </div>

                                <div class="field-title">Ulica</div>
                                <input type="text" class="field" autocomplete="address-line1" name="ulica_kurier" data-validate data-store>

                                <div class="desktopRow spaceColumns">
                                    <div>
                                        <div class="field-title">Nr domu</div>
                                        <input type="text" class="field" autocomplete="address-line2" name="nr_domu_kurier" data-validate data-store>
                                    </div>
                                    <div>
                                        <div class="field-title">Nr lokalu</div>
                                        <input type="text" class="field" autocomplete="address-line3" name="nr_lokalu_kurier" data-store>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="caseOsobiscie" class="expand_y hidden animate_hidden" style="min-height: 100px;margin-top:30px">
                            <h3 style="font-size: 20px;" data-view="adres">Odbierz osobiście</h3>
                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.2636336885503!2d20.905582677315724!3d52.23998412001319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecb16c2ce5633%3A0x4cf6063af810a380!2sSolectric%20GmbH%20Polska!5e0!3m2!1spl!2spl!4v1581018622179!5m2!1spl!2spl" width="600" height="450" frameborder="0" style="border:0;width: 100%;" allowfullscreen=""></iframe>
                        </div>

                        <div style="display:none">
                            <input type="text" name="imie_dostawa" data-store>
                            <input type="text" name="nazwisko_dostawa" data-store>
                            <input type="text" name="firma_dostawa" data-store>
                            <input type="text" name="kraj_dostawa" data-store>
                            <input type="text" name="kod_pocztowy_dostawa" data-store>
                            <input type="text" name="miejscowosc_dostawa" data-store>
                            <input type="text" name="ulica_dostawa" data-store>
                            <input type="text" name="nr_domu_dostawa" data-store>
                            <input type="text" name="nr_lokalu_dostawa" data-store>
                            <input type="text" name="notes" data-store>
                            <input type="text" name="track" data-store>
                            <input type="text" name="cache_basket" data-store>
                            <input type="checkbox" name="rebate_generated" data-store>
                        </div>
                    </div>
                </div>
            </div>
            <div id="menu3" class="menu mobileRow podsumowanie" style="max-width: 800px; display:none;">
                <div class="menu-holder">
                <div class="mobileRow">

                    <div style="width:100%;max-width: 300px; margin: 0 auto;" class="noMaxWidthMobile">

                        <h4>Dane kontaktowe <button class="btn subtle" onclick="showMenu(2,'kontakt')">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button></h4>

                        <p id="daneKontaktoweInfo"></p>

                        <h4>Rodzaj dostawy <button class="btn subtle" onclick="showMenu(2,'dostawa')">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button></h4>

                        <p id="dostawaRodzaj"></p>

                        <h4>Adres dostawy <button class="btn subtle" onclick="showMenu(2,'adres')">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button></h4>

                        <p id="adresInfo"></p>

                        <h4>Forma zapłaty
                            <button class="btn primary" onclick="showMenu(3)">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button>
                        </h4>

                        <p id="zaplataInfo"></p>

                        <!--<input id="adresInfoInput" name="adresInfo" type="hidden">-->

                        <input name="forma_zaplaty" type="hidden" data-store="forma_zaplaty">
                        <input name="impersonate" type="hidden" value="<?= $impersonate ?>">


                    </div>
                    <div style="width: 100%;margin: 0 auto;">

                        <div id="estimatedDelivery" style="display:none">
                            <h4>Przewidywany termin dostarczenia przesyłki</h4>
                            <p class="label"><?php
                                                if (date("H") < 13) {
                                                    $date = date("Y-m-d", time() + 3600 * 24);
                                                } else {
                                                    $date = date("Y-m-d", time() + 3600 * 24 * 2);
                                                }
                                                echo niceDate($date);
                                                ?></p>
                        </div>

                        <h4 style="margin-top: 40px">Twoje uwagi dotyczące zamówienia</h4>
                        <textarea name="uwagi" style="width: 100%; height: 80px; resize: none; border-radius: 4px;padding:4px"><?= htmlspecialchars($zamowienie_data["uwagi"]) ?></textarea>

                        
                    </div>

                </div>
                </div>
            </div>
        </div>
        <div style="margin: 0 auto;" class="steps-holder">
            <div class="stepHolder" style="padding: 10px 20px;">
                <h3 id="menu1-steps-title" style="font-size: 26px;font-weight:600;margin: 0;">Podsumowanie koszyka</h3>
                <h3 id="menu2-steps-title" style="font-size: 26px;font-weight:600;margin: 0;display:none;">Zamówienie</h3>
                <h3 id="menu3-steps-title" style="font-size: 26px;font-weight:600;margin: 0;display:none;">Podsumowanie</h3>
                <div class="variant_list_holder_2"></div>

                <!-- WARTOŚĆ KOSZYKA -->
                <div style="margin-top: 13px;" class="hideifempty">
                    <div class="display:inline-block;">
                        <span style="font-size: 18px;">Wartość koszyka:</span>
                        <span style="font-size: 20px;float:right;" class="pln total_basket_cost"></span>
                    </div>
                    <hr>
                </div>

                <!-- RABAT - KOD -->
                <label style="margin:10px 0">
                    <?php if ($app["user"]["id"]) : ?>
                        <div id="rabat_hide" class="expand_y">
                            <span>Mam kod rabatowy</span>
                            <div style="display:flex">
                                <input type="text" id="kod_rabatowy" class="field">
                                <button style="margin-left:-1px;width: auto;font-size: 15px;" class="btn primary medium" onclick="aktywujKodRabatowy('add')">Aktywuj</button>
                            </div>
                            <div id="kod_rabatowy_reason" style="color: red;font-size: 13px;"></div>
                        </div>
                    <?php else : ?>
                        <div class="">
                            <b>Kod rabatowy</b><br>tylko dla zalogowanych użytkowników
                        </div>
                    <?php endif ?>
                </label>

                <!-- RABAT -->
                <div style="color: var(--primary-clr);" class="hideifempty expand_y hidden animate_hidden" id="kod_rabatowy_wrapper">
                    <div class="display:inline-block;">
                        <span style="font-size: 18px;">Rabat:</span>
                        <span style="font-size: 20px;float:right;">
                            <button onclick="aktywujKodRabatowy('remove')" style="cursor:pointer;font-weight: bold;margin-right: 5px;font-size: 11px;line-height: 0;width: 18px;height: 18px;border: none;background: #eee;color: #777;vertical-align: text-top;padding: 0;">
                                <img class='cross-icon' src='/src/img/cross.svg'>
                            </button>
                            <span class="pln" id="kod_rabatowy_label"></span>
                        </span>
                    </div>
                </div>

                <hr>

                <!-- TODO: Zamiast osobnych menu włączać pojedyncze elementy -->
                <div class="stepContent expand_y">
                    <div id="menu1-steps" class="stepBox showNow">
                        <div>
                            <div id="menu1_cart" class="mobile-column" style="display:flex;justify-content: center;flex-wrap:wrap;margin-top: 15px;">
                                <?php if (!$app["user"]["id"]) : ?>
                                    <div>
                                        <button class="btn primary medium" onclick="showModal('loginForm',{source:this});" style="min-width:250px;margin-top: 25px;">
                                            Zaloguj się
                                            <img class="user-icon icon-white" src="/src/img/user_icon.svg" style="width: 1.2em;vertical-align: sub;">
                                        </button>
                                        <br><br>
                                        <div class="hideifempty">
                                            <strong>Co zyskasz?</strong>
                                            <div>- Historia zamówień</div>
                                            <div>- Zapisanie danych<br>kontaktowych oraz adresu</div>
                                            <div>- Zapisanie schowka oraz<br>statnio przeglądanych produktów</div>
                                        </div>
                                    </div>
                                    <div style='margin:12px;margin-top:34px' class="lub-span">lub</div>
                                <?php else : ?>
                                    <div style="flex-grow:1"></div>
                                <?php endif ?>
                                <div class="steps-buttons">
                                    <button class="btn <?= $app["user"]["id"] ? "primary" : "secondary" ?> medium" onclick="showMenu(2, 'kontakt')" style="margin-top: 25px;min-width:250px">
                                        <?php
                                        if ($app["user"]["id"]) {
                                            echo "Przejdź do dostawy";
                                        } else {
                                            echo "Kontynuuj bez rejestracji";
                                        }
                                        ?>
                                        <i class="fa fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="menu2-steps" class="stepBox" style="display:none;">
                        <div>
                            <div>
                                <span style="font-size: 18px;">Dostawa:</span>
                                <span style="font-size: 20px;float:right;">
                                    <span class="pln" id="koszt_dostawy_label">20 zł</span>
                                </span>
                            </div>
                            <hr>
                            <div class="hideifempty" style="margin: 0 0 20px;">
                                <!-- TODO: Zrobić to inaczej - jak będzie więcej to będzie dupa -->
                                <h3 style="font-size: 20px;font-weight:600;margin:13px 0;">Płatność</h3>
                                <radio-input name="forma_zaplaty_radio" class="default">
                                    <radio-option value="p24" data-default>
                                        Zapłać online <i style="font-size: 18px;color: #555;" class="fas fa-credit-card"></i>
                                        <!-- <img style="padding:4px;width: 70px;vertical-align: middle;" src="/img/p24.png"> -->
                                    </radio-option>
                                    <radio-option value="po">
                                        Za pobraniem <i style="font-size: 18px;color: #555;" class="fas fa-hand-holding-usd"></i>
                                    </radio-option>
                                </radio-input>
                            </div>
                            <div class="steps-buttons">
                                <button class="btn secondary medium desktopSpaceRight btn secondary" onclick="showMenu(1)" style="display:inline-block;width:220px">
                                    <i class="fa fa-chevron-left"></i>
                                    Wróć
                                </button>
                                <button class="btn primary medium" onclick="showMenu(3,'podsumowanie')" style="display:inline-block;width:220px">
                                    Podsumowanie
                                    <i class="fa fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="menu3-steps" class="stepBox" style="display:none;">
                        <div>
                            <div style="margin-top: 13px;" class="hideifempty ">
                                <div>
                                    <span style="font-size: 18px;">Dostawa:</span>
                                    <span style="font-size: 20px;float:right;">
                                        <span class="pln" id="koszt_dostawy_label">20 zł</span>
                                    </span>
                                </div>
                                <hr>
                                <div>
                                    <!-- TODO: plus koszt dostawy -->
                                    <span style="font-size: 18px;">Całkowity koszt zamówienia:</span>
                                    <span style="font-size: 20px;float:right;" id="final-cost" class="pln"></span>
                                </div>
                                <hr>
                                <div>
                                    <!-- TODO: Wybrana metoda płatności -->
                                    <span style="font-size: 18px;">Metoda płatności:</span>
                                    <span style="font-size: 20px;float:right;" class="pln">
                                        <img style="width: 80px;vertical-align: middle;" src="/img/p24.png">
                                    </span>
                                </div>
                            </div>

                            <!-- TODO: Inne rzeczy -->
                            <label class="checkbox-wrapper field-title" style="margin: 16px 0;">
                                <input type="checkbox" data-validate="checkbox|value:1">
                                <div class="checkbox"></div>
                                Akceptuję
                                <a href="/regulamin" target="_blank" style="font-weight: bold;color: var(--primary-clr);text-decoration: underline;">REGULAMIN</a>
                            </label>

                            <div class="steps-buttons">
                                <button class="btn secondary medium desktopSpaceRight btn secondary" onclick="showMenu(2,'kontakt')" style="display:inline-block;width:170px">
                                    <i class="fa fa-chevron-left"></i>
                                    Cofnij
                                </button>
                                <button onclick="confirmOrder()" class="btn primary medium" style="width: 260px;margin-left:auto">
                                    <span id="submit_text">ZAMAWIAM I PŁACĘ</span>
                                    <i class="fa fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php include "global/footer.php"; ?>
</body>

</html>