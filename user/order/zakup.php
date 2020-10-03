<?php //route[zakup]

$progressBarCounter = 0;

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

  "uwagi" => "",
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

$parts = explode("/", $url);
$impersonate = 0;
if (isset($parts[1]) && strlen($parts[1]) > 5) {
  $zamowienie_link = $parts[1];
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
          showMenu(e.getAttribute("data-id"));
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
    });

    function isFormValid() {
      return validateForm($("#menu" + currentMenu));
    }

    function copyAdres() {
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

      if (i > currentMenu && isFormValid() == false) return;

      var wasMenu = currentMenu;
      currentMenu = i;

      removeClasses("current", ".progress-item");
      var progressItem = $(`.progress-item[data-id="${currentMenu}"]`);
      if (progressItem) {
        progressItem.classList.add("current");
      }

      wait = true;
      var was = $("#menu" + wasMenu);
      var now = $("#menu" + i);
      was.classList.remove("showNow");
      $("#menu" + i).style.display = "flex";
      now.style.position = "fixed";
      now.style.height = "";
      setTimeout(function() {
        was.style.display = "none";
        now.classList.add("showNow");
        now.style.position = "";
        wait = false;

        setTimeout(function() {
          setCustomHeights();
          var view = $(`[data-view='${scroll}`);
          if (view) {
            scrollToView(view);
          } else {
            var view = now.find(`*`);
            if (view) {
              scrollToView(view);
            }
          }
        }, 10);
      }, 200);

      if (i == 1) {
        $(".variant_list_holder_1").appendChild($(".variant_list_full"));
      } else if (i == 3) {
        $(".variant_list_holder_2").appendChild($(".variant_list_full"));

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
      setBuyer(false);
    }

    function setBuyer(user = true) {
      BUYER_TYPE = $("#priv").checked ? "p" : "f";
      if (user) {
        setValue($(`[name="buyer_type"]`), BUYER_TYPE);
      }
      $("#casePerson").classList.toggle("expanded", BUYER_TYPE == 'f');
      $$(".caseFirma").forEach((e) => {
        e.classList.toggle("expanded", BUYER_TYPE == 'f');
      });

      expand($("#casePerson"), BUYER_TYPE == 'p');
      expand($(".caseFirma"), BUYER_TYPE == 'f');
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
          e.dispatchEvent(new Event("change"));
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

      if (rabat == 0) {
        $("#kod_rabatowy_wrapper").style.display = "none";
        $("#rabat_hide").style.display = "block";
      } else {
        $("#kod_rabatowy").style.borderColor = "";
        $("#kod_rabatowy_wrapper").style.display = "block";
        $("#kod_rabatowy_label").innerHTML = "-" + RABAT + (RABAT_TYPE == "static" ? "zł" : "%");
        $("#rabat_hide").style.display = "none";
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

      showBasketChanges(res, $(`.variant_list_full`), zakup_basket_row_template);

      // TODO: rebate as a part of basket ;)
      updateTotalCost();
    });

    const zakup_basket_row_template = `
      <div class='expand_y'>
        <div class='product_row'>
          <div class='cl cl1'><img class='product_image' data-height='1w' data-type="src"></div>
          <div class='cl cl2'><a class='link product_link product_name'></a></div>
          <div class='pln cl cl3' style='font-weight:normal'><label>Cena:</label> <span class='product_price'></span> zł</div>
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
          <div class='cl cl5'><label>Suma:</label> <span class='pln product_total_price'></span></div>
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

  <div class="progress-bar-wrapper hideifempty">
    <div class="progress-bar">
      <div class="progress-item current" data-id="1">
        <span class="progress-count"><?= ++$progressBarCounter ?></span>
        <span class="progress-title">
          <img src="/src/img/basket.png" style="width:22px;margin-top: -4px;">
          <span>Koszyk</span>
        </span>
      </div>

      <div class="progress-item" data-id="2">
        <span class="progress-count"><?= ++$progressBarCounter ?></span>
        <span class="progress-title">
          <img src="/img/courier.png" style="width:36px">
          <span>
            Dane do wysyłki
          </span>
        </span>
      </div>

      <div class="progress-item" data-id="3">
        <span class="progress-count"><?= ++$progressBarCounter ?></span>
        <span class="progress-title">
          <i class="far fa-check-square" style="font-size: 24px"></i>
          <span> Podsumowanie</span>
        </span>
      </div>
    </div>
  </div>

  <div class="main-container" id="zakupForm" style="margin-bottom: 50px;width: 100%;" data-form>

    <div id="menu1" class="menu showNow" style="max-width: 1000px;">
      <div style="margin: auto;width:100%;padding: 20px 10px;">

        <?php if (isset($_GET['produkt'])) : ?>
          <h3 style="margin:20px;color:red;text-align:center">Niestety produkt został już wyprzedany!<br><span style="font-weight: normal;">Musisz zmienić zawartość koszyka</span></h3>
        <?php endif ?>

        <h3 style="text-align: center;font-size: 26px;padding: 40px 0 20px;;margin: 0;">Twój koszyk</h3>

        <!--<div class="zamowienie adjustable-list"></div>-->

        <div class="variant_list_holder_1">
          <div class='variant_list_full'>
            <div class='case_basket_empty expand_y'>
              <h3 style='text-align:center;margin:2em 0'>Koszyk jest pusty!</h3>
            </div>
            <div class='header case_basket_not_empty' style='background: var(--primary-clr);color: white;'>
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

        <div style="margin-top: 30px;">
          <div style="margin-top: 13px;text-align: right;padding: 5px;" class="hideifempty mobileTextCenter">
            <span style="display:inline-block;font-size: 18px;padding: 0 3px;">Wartość koszyka:</span>
            <span style="display:inline-block;font-size: 20px;" class="pln total_basket_cost"></span>

            <p style='font-weight:normal;margin:0;font-size: 1.1em;'>Kurier: <span class="pln"><?= config('kurier_cena', 0) ?> zł</span>, Paczkomat: <span class="pln"><?= config('paczkomat_cena', 0) ?> zł</span>, Odbiór osobisty: <span class="pln">0 zł</span></p>

            <p style='font-weight:normal;margin:0;font-size: 1.1em'>Czas realizacji: <span class="pln">24h</span></p>
          </div>

          <div class="mobile-column" style="display:flex;justify-content: center;flex-wrap:wrap;margin-top: 15px;">
            <?php if (!$app["user"]["id"]) : ?>
              <div>
                <button class="btn primary medium" onclick="showModal('loginForm',{source:this});" style="min-width:250px;margin-top: 25px;">Zaloguj się <i class="fa fa-user"></i></button>
                <br><br>
                <div class="hideifempty">
                  <strong>Co zyskasz?</strong>
                  <div>- Dostęp do historii zamówień</div>
                  <div>- Zapisanie danych kontaktowych</div>
                </div>
              </div>
              <div style='margin:12px;margin-top:34px' class="lub-span">lub</div>
            <?php else : ?>
              <div style="flex-grow:1"></div>
            <?php endif ?>
            <div>
              <button class="btn <?= $app["user"]["id"] ? "primary" : "secondary" ?> medium" onclick="showMenu(2, 'kontakt')" style="margin-top: 25px;min-width:250px">
                <?php
                if ($app["user"]["id"]) {
                  echo "Złóż zamówienie";
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
    </div>

    <div id="menu2" class="menu" style="max-width: 1200px; display:none">
      <div class="mobileRow">
        <div style="width:100%;padding: 20px 10px;">
          <div style="max-width: 550px;margin: 0 auto;">
            <h3 style="text-align: center;font-size: 26px;padding: 40px 0 20px;;margin: 0;" data-view="kontakt">Dane kontaktowe</h3>

            <div style="display:flex;justify-content:space-evenly;padding:10px">
              <input name="buyer_type" type="hidden" onchange="setBuyerFromInput(this.value)" data-store="buyer_type">
              <label>
                <input type="radio" id="priv" name="buyer" value="p" onchange="setBuyer()">
                Osoba prywatna
              </label>
              <label>
                <input type="radio" id="comp" name="buyer" value="f" onclick="setBuyer()">
                Firma
              </label>
            </div>

            <div id="casePerson" class="expand_y">
              <div class="field-title">Imię</div>
              <input type="text" class="field" name="imie" autocomplete="first-name" data-validate data-store>

              <div class="field-title">Nazwisko</div>
              <input type="text" class="field" name="nazwisko" autocomplete="family-name" data-validate data-store>
            </div>

            <div class="expand_y caseFirma hidden animate_hidden">
              <div class="field-title">Nazwa firmy</div>
              <input type="text" class="field" name="firma" autocomplete="organization" data-validate data-store>

              <div class="field-title">NIP</div>
              <input type="text" class="field" name="nip" data-validate="nip" data-store>
            </div>

            <div class="field-title">Adres e-mail</div>
            <input type="text" class="field" name="email" autocomplete="email" data-validate="email" data-store>

            <div class="field-title">Nr telefonu</div>
            <input type="text" class="field" name="telefon" autocomplete="tel" data-validate data-store>

            <div class="field-title">Kraj</div>
            <input type="text" class="field" name="kraj" data-validate data-store>

            <div class="miejscowosc-picker-wrapper">
              <div class="field-title">Kod pocztowy</div>
              <input type="text" class="field" name="kod_pocztowy" autocomplete="postal-code" onchange="kodPocztowyChange(this)" data-validate data-store>

              <div class="field-title">Miejscowość</div>
              <input class="field miejscowosc-picker-target" type="text" name="miejscowosc" autocomplete="address-level2" placeholder=" " data-validate data-store>
              <div class="miejscowosc-picker-list"></div>
            </div>

            <div class="field-title">Ulica</div>
            <input type="text" class="field" name="ulica" autocomplete="address-line1" data-validate data-store>

            <div class="desktopRow spaceColumns">
              <div>
                <div class="field-title">Nr domu</div>
                <input type="text" class="field" name="nr_domu" autocomplete="address-line2" data-validate data-store>
              </div>
              <div>
                <div class="field-title">Nr lokalu</div>
                <input type="text" class="field" name="nr_lokalu" autocomplete="address-line3" data-store>
              </div>
            </div>
          </div>
        </div>

        <div style="width:100%;padding: 20px 10px;">
          <div style="max-width: 550px;margin: 0 auto;">
            <h3 style="text-align: center;font-size: 26px;padding: 40px 0 20px;;margin: 0;" data-view="dostawa">Rodzaj dostawy</h3>

            <input id="dostawaInput" name="dostawa" type="hidden" onchange="selectDostawaFromInput(this.value)" data-store />
            <input name="paczkomat" type="hidden" data-store="paczkomat">

            <div>
              <div class="dostawa" id="kurier-option" onclick="selectDostawa(this.id)">
                <img src="/img/courier.png" style="width:40px"> <span>Kurier</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">+<?= config('kurier_cena', 0) ?> zł</span>
              </div>

              <div class="dostawa" id="paczkomat-option" onclick="showPaczkomatPicker()">
                <img src="/img/inpost_logo.png" style="width:60px"> <span>Paczkomat</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">+<?= config('paczkomat_cena', 0) ?> zł</span>
              </div>

              <div class="dostawa" id="osobiscie-option" onclick="selectDostawa(this.id)">
                <i class="fa fa-user" style="font-size: 26px;margin: 4px;"></i> <span>Odbiór osobisty</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">0 zł</span>
                <input name="oddzial_id" value="0" type="hidden" data-store>
              </div>
            </div>

            <div style="min-height: 120px;">
              <div id="casePaczkomat" class="expand_y hidden animate_hidden" style="margin:10px 0;display: flex;flex-direction:column;justify-content:center;min-height: 100px;">
                <div style="display:flex;justify-content:center;font-size:18px;line-height:1.3;">
                  <div id="paczkomatAdres">

                  </div>
                </div>
              </div>

              <div id="caseKurier" class="expand_y hidden animate_hidden">
                <h3 style="text-align: center;font-size: 26px;margin: 15px 0 15px;" data-view="adres">Adres dostawy</h3>

                <button class="btn primary" type="button" onclick="copyAdres()" style="width:auto;margin:0 auto 10px;display:block"><i class="fa fa-copy"></i> Przepisz moje dane</button>
                <!--<label class="checkbox-wrapper">
                  <input type="checkbox" name="same_address">
                  <div class="checkbox"></div>
                  Użyj tego samego adresu 
                </label>--->


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

              <div id="caseOsobiscie" class="expand_y hidden animate_hidden" style="min-height: 100px;margin-top:30px">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.2636336885503!2d20.905582677315724!3d52.23998412001319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecb16c2ce5633%3A0x4cf6063af810a380!2sSolectric%20GmbH%20Polska!5e0!3m2!1spl!2spl!4v1581018622179!5m2!1spl!2spl" width="600" height="450" frameborder="0" style="border:0;width: 100%;" allowfullscreen=""></iframe>
              </div>

              <div style="display:none">
                <h3 style="text-align: center;font-size: 26px;margin: 15px 0 15px;">Forma zapłaty</h3>

                <div class="mobileRow" style="justify-content: space-evenly;">
                  <label id="forma_24">
                    <input type="radio" name="forma_zaplaty_radio" value='24' checked id="p24">
                    <img style="width: 100px;vertical-align: middle;" src="/img/p24.png">
                  </label>
                  <label id="forma_po">
                    <input type="radio" name="forma_zaplaty_radio" value='po'>
                    Za pobraniem <i style="font-size: 22px;color: #555;" class="fas fa-hand-holding-usd"></i>
                  </label>
                </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>


      <div style="padding: 10px;display: flex;justify-content: space-between;max-width: 1170px;margin: 0 auto;width: 100%;">
        <button class="btn secondary medium desktopSpaceRight btn secondary" type="button" onclick="showMenu(1)" style="margin-top: 30px; display:inline-block;width:220px">
          <i class="fa fa-chevron-left"></i>
          Cofnij
        </button>
        <button class="btn primary medium" type="button" onclick="showMenu(3,'podsumowanie')" style="margin-top: 30px; display:inline-block;width:220px">
          Dalej
          <i class="fa fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div id="menu3" class="menu mobileRow podsumowanie" style="max-width: 1100px; display:none;padding:20px 0">
      <h3 style="text-align: center;font-size: 26px;padding: 40px 0 20px;;margin: 0;" data-view="podsumowanie">Podsumowanie</h3>
      <div class="mobileRow">

        <div style="width:100%;max-width: 300px; margin: 0 auto;padding: 10px;" class="noMaxWidthMobile">

          <h4>Dane kontaktowe <button type="button" class="btn subtle" onclick="showMenu(2,'kontakt')">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button></h4>

          <p id="daneKontaktoweInfo"></p>

          <h4>Rodzaj dostawy <button type="button" class="btn subtle" onclick="showMenu(2,'dostawa')">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button></h4>

          <p id="dostawaRodzaj"></p>

          <h4>Adres dostawy <button type="button" class="btn subtle" onclick="showMenu(2,'adres')">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button></h4>

          <p id="adresInfo"></p>

          <h4>Forma zapłaty
            <!--<button type="button" class="btn primary" onclick="showMenu(3)">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button>-->
          </h4>

          <p id="zaplataInfo"></p>

          <!--<input id="adresInfoInput" name="adresInfo" type="hidden">-->

          <input name="forma_zaplaty" type="hidden" data-store="forma_zaplaty">
          <input name="impersonate" type="hidden" value="<?= $impersonate ?>">


        </div>
        <div style="width: 100%;margin: 0 auto;padding: 10px;">
          <h4>Produkty</h4>

          <div class="variant_list_holder_2">

          </div>

          <div class="mobileRow" style="justify-content:space-between;margin-top: 10px;">
            <label style="margin:10px 0">
              <?php if ($app["user"]["id"]) : ?>
                <div id="rabat_hide">
                  <span>Kod rabatowy</span>
                  <div style="display:flex">
                    <input type="text" id="kod_rabatowy" class="field">
                    <button type="button" style="margin-left:-1px;width: auto;font-size: 15px;" class="btn primary medium" onclick="aktywujKodRabatowy('add')">Aktywuj</button>
                  </div>
                  <div id="kod_rabatowy_reason" style="color: red;font-size: 13px;"></div>
                </div>
              <?php else : ?>
                <div class="mobileTextCenter">
                  <b>Kod rabatowy</b><br>tylko dla zalogowanych użytkowników
                </div>
              <?php endif ?>
            </label>

            <div style="margin-top: 13px;text-align: right;padding: 5px;" class="mobileTextCenter">
              <span style="display:block;font-size: 15px;">Koszt dostawy: <span class="pln" id="koszt_dostawy_label"></span></span>
              <span style="font-size: 15px;display:none;color: var(--primary-clr);font-weight: bold;" id="kod_rabatowy_wrapper">
                <button type="button" onclick="aktywujKodRabatowy('remove')" style="cursor:pointer;font-weight: bold;margin-right: 5px;font-size: 11px;line-height: 0;width: 18px;height: 18px;border: none;background: #eee;color: #777;vertical-align: text-top;padding: 0;"><i class="fa fa-times"></i></button>
                KOD RABATOWY <span class="pln" id="kod_rabatowy_label"></span></span>
              <span style="display:inline-block;font-size: 16px;padding: 0 3px;">Całkowity koszt zamówienia:</span>
              <b style="display:inline-block;font-size: 20px;"><span id="final-cost" style="display:inline-block;" class="pln"><?= $app["user"]["basket"]["total_basket_cost"] ?></span> zł</b>
            </div>
          </div>

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
          <textarea name="uwagi" style="width: 100%; height: 80px; resize: none; border-radius: 4px;padding:4px"><?= htmlspecialchars($uwagi) ?></textarea>

          <label class="checkbox-wrapper field-title">
            <input type="checkbox" data-validate="checkbox|value:1">
            <div class="checkbox"></div>
            Akceptuję
            <a href="/regulamin" target="_blank" style="font-weight: bold;color: var(--primary-clr);text-decoration: underline;">REGULAMIN</a>
          </label>


          <div class="mobileRow" style="align-items:flex-start">
            <p style="font-size: 15px;">Zostaniesz przeniesiony do strony płatności <img src="/img/p24.png" style="width: 100px;vertical-align: bottom;transform: translateY(4px);"></p>
            <!--<div id="hideOnSuccess">
                <div id="casegpay" style="display:none;margin-bottom: 5px;">Zapłać za pomocą <img src="/img/gpay.png" style="display: inline-block;width: 40px;vertical-align: bottom;margin-left: 2px;">:</div>
                <div id="payment-request-button"></div>
              </div>-->

            <button onclick="confirmOrder()" class="btn primary medium full-width-mobile" style="margin-top: 10px;width: 260px;margin-left:auto">
              <span id="submit_text">ZAMAWIAM I PŁACĘ</span>
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>

      </div>

      <div style="padding: 10px">
        <button class="btn secondary medium pullHigherDesktop" type="button" onclick="showMenu(2,'kontakt')" style="display:inline-block;width:170px">
          <i class="fa fa-chevron-left"></i>
          Cofnij
        </button>
      </div>

    </div>

  </div>
  <?php include "global/footer.php"; ?>
</body>

</html>