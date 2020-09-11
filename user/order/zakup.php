<?php //route[zakup]

$basket = json_decode($_SESSION["basket"], true);
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

  $_SESSION["basket"] = json_encode($basket);

  include "helpers/order/get_basket_data.php";

  unset($_SESSION["kod"]);
  $_SESSION["rabat"] = $zamowienie_data["rabat"];
  $_SESSION["user_id_impersonate"] = nonull($zamowienie_data, "user_id", null);
  $_SESSION["user_type_impersonate"] = nonull($zamowienie_data, "user_type", null);
  $impersonate = 1;
} else {
}

$res = "";
if (empty($app["user"]["basket"]["variants"])) {
  $res = "<h3 style='text-align:center'>Twój koszyk jest pusty!</h3>";
} else {
  $res = printBasketTable();
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
  <style>
    label {
      margin-top: 3px;
    }

    @media only screen and (min-width: 750px) {
      .pullHigherDesktop {
        margin-top: -58px;
        margin-bottom: 58px;
        display: block !important;
      }
    }

    .podsumowanie table button {
      display: none;
    }

    .dostawa {
      padding: 7px 3px;
      border: 1px solid #ccc;
      /*width: 50%;*/
      margin: 3px;
      border-radius: 4px;
      text-align: center;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: 0.2s;
      height: 47px;
    }

    .dostawa * {
      vertical-align: middle;
      margin: 2px;
    }

    /*#osobiscie-option * {
        margin-top: 4px;
      }*/
    .selectedDostawa {
      /*color: var(--primary-clr);
        font-weight: bold;
        border-color: var(--primary-clr);*/
      color: white;
      background: var(--primary-clr);
      border-color: var(--primary-clr);
    }

    .dostawa img {
      transition: 0.2s;
    }

    .selectedDostawa img {
      filter: invert() hue-rotate(180deg) brightness(3.5);
    }

    #total {
      display: inline-block;
      padding: 10px;
    }

    .items>div {
      margin: 14px 0 !important;
    }

    h4 {
      margin: 20px 0 5px;
      font-size: 16px;
    }

    p {
      margin: 10px 0;
    }

    .desktopSpaceRight {
      margin-right: 60px;
    }

    @media only screen and (max-width: 500px) {
      .table>div {
        flex-direction: column;
      }

      .table>div>div:nth-child(2) {
        text-align: right;
        margin-top: 8px;
      }
    }

    @media only screen and (min-width: 800px) {
      #zaplataInfo {
        margin-bottom: 60px;
      }
    }

    @media only screen and (max-width: 800px) {
      .desktopSpaceRight {
        margin-right: 10px !important;
      }

      #closeBtn {
        margin-left: 0 !important;
      }

      .mobileRow>.dostawa {
        width: 100% !important;
        margin: 10px 0 !important;
        padding: 10px !important;
      }
    }

    #closeBtn {
      width: 100px;
      margin-left: -120px;
      margin-right: 10px;
      border: none;
      background: none;
      cursor: pointer;
    }

    .button {
      width: 100%;
    }

    .menu {
      transition: opacity 0.2s;
      width: 100%;
      margin: auto;
      justify-content: center;
      flex-direction: column;
      display: flex;
    }

    .showNow {
      opacity: 1;
    }

    .menu:not(.showNow) {
      opacity: 0;
    }

    #paczkomat-picker {
      position: fixed;
      background: white;
      width: 100vw;
      height: 100vh;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      opacity: 0;
      pointer-events: none;
      transition: 0.3s;
      transform: scale(0.9) translateY(-300px);
      padding-bottom: 10px;
    }

    .paczkomat-picker-open {
      opacity: 1 !important;
      pointer-events: all !important;
      transform: translateY(0px) !important;
      z-index: 200000 !important;
    }

    #easypack-map {
      width: 100%;
      height: calc(100vh - 44px);
    }

    .select-link {
      background-color: var(--primary-clr) !important;
      width: 100%;
      text-align: center;
      background-image: none !important;
      padding: 2px !important;
    }

    @media only screen and (min-width: 768px) {
      #searchWidget {
        padding: 0 !important;
        border: 1px solid #eee;
        margin: 0 10px !important;
        background: white;
        width: calc(100% - 20px);
      }

      .input-group-btn {
        width: auto !important;
      }
    }

    .easypack-widget .search-widget .input-group {
      padding: 0 !important;
      box-sizing: border-box !important;
    }

    .easypack-widget .input-group {
      display: flex;
    }

    #searchWidget {
      padding: 10px 10px 0;
    }

    .current-type-wrapper {
      padding: 10px !important;
    }

    /* progress-bar start */
    .progress-bar-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      margin-bottom: 20px;
      user-select: none;
    }

    .progress-bar {
      display: inline-flex;
      justify-content: center;
      position: relative;
    }

    .progress-bar:before {
      content: "";
      background: #ccc;
      width: 100%;
      height: 6px;
      position: absolute;
      display: block;
      top: 50%;
      left: 0;
      transform: translateY(-50%);

    }

    .progress-item.current~.progress-item:after {
      width: 0;
    }

    .progress-item:not(:first-child):after {
      content: "";
      background: #2647ff;
      width: calc(100% - 34px);
      height: 6px;
      position: absolute;
      display: block;
      top: 50%;
      left: calc(17px - 50%);
      transform: translateY(-50%);
      transition: 0.2s width;
    }

    .progress-count {
      background: #2647ff;
      color: white;
      display: inline-flex;
      width: 33px;
      height: 33px;
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      position: relative;
      border: 3px solid #2647ff;
      font-weight: 600;
      transition: 0.2s all;
    }

    .progress-item.current~.progress-item .progress-count {
      color: #bbb;
      border-color: #bbb;
      background: white;
    }

    .progress-item.current .progress-count {
      background: #fff;
      color: #2647ff;
      width: 39px;
      height: 39px;
      margin: -4px;
      font-size: 1.3em;
    }

    .progress-item:first-child:before,
    .progress-item:last-child:before {
      content: "";
      background: white;
      height: 100%;
      width: 50%;
      display: block;
      position: absolute;
    }

    .progress-item:first-child:before {
      left: 0;
    }

    .progress-item:last-child:before {
      right: 0;
    }

    .progress-item {
      position: relative;
      min-width: 95px;
      text-align: center;
      cursor: pointer;
    }

    .progress-title {
      position: absolute;
      top: 100%;
      left: 50%;
      padding-top: 10px;
      transform: translateX(-50%);
      width: 100%;
      transition: 0.2s 0.1s all;
    }

    .progress-item:not(.current) .progress-title {
      opacity: 0.35;
    }

    .progress-title * {
      vertical-align: middle;
    }

    .progress-title span {
      transform: translateY(2px);
      display: inline-block;
    }

    @media only screen and (min-width: 800px) {
      .progress-bar-wrapper {
        margin-top: 50px;
        margin-bottom: 20px;
      }

      .progress-item {
        min-width: 170px;
      }
    }

    @media only screen and (max-width: 800px) {
      .progress-title span {
        display: none;
      }

      .lub-span {
        display: none;
      }

      .mobile-column {
        flex-direction: column;
        align-items: center;
      }
    }

    @media only screen and (max-width: 350px) {
      .progress-item {
        min-width: 80px;
      }
    }

    .progress-item.current {
      pointer-events: none;
    }

    /* progress-bar end */
  </style>
  <script>
    window.addEventListener("DOMContentLoaded", function() {
      window.form = $("#zakupForm");
      window.form.findAll("[name]").forEach(input => {
        window.form[input.name] = input;
      });

      ignoreValueChanges = true;
      setFormData(<?= json_encode($zamowienie_data) ?>, window.form);
      loadFormFromCookies();
      ignoreValueChanges = false;


      if (BASKET_COST == 0) {
        $$("btn primary big").forEach((e) => {
          e.style.display = "none"
        });
      }

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

    function addItem(diff, variant_id) {
      addItemtoBasket(variant_id, diff, (json) => {
        if (!json.basket_table_html) {
          json.basket_table_html = `
              <div style="text-align:center">
              <h3>Koszyk jest pusty!</h3>
              <a class="btn primary big" href="/" style='width: 220px'>
                Rozpocznij zakupy
                <i class="fa fa-chevron-right"></i>
              </a></div>`;

          emptyBasket();
        }

        $$(".zamowienie").forEach((e) => {
          setContent(e, json.basket_table_html);
        });

        BASKET_COST = json.total_basket_cost;
        $$(".total").forEach((e) => {
          e.innerHTML = BASKET_COST;
        });
        updateTotalCost();

        $$(`[data-variant_id="${variant_id}"]`).forEach(v => {
          v.style.animation = "blink 0.5s";
        });
      });
    }

    function emptyBasket() {
      $$("button, .hideifempty").forEach(e => {
        e.style.opacity = "0.3";
        e.style.pointerEvents = "none";
      });
    }
    <?php if (empty($app["user"]["basket"]["variants"])) : ?>
      window.addEventListener("DOMContentLoaded", function() {
        emptyBasket();
      });
    <?php endif ?>


    function isFormValid() {
      if (currentMenu == 4) {
        if (!$("#accept-regulamin").checked) {
          $("#regulamin-warn").style.display = "inline-block";
          return false;
        }
      }

      return validateForm($("#menu" + currentMenu));
    }

    function copyAdres() {
      setValue(form.kraj_kurier, form.kraj.value);
      setValue(form.miejscowosc_kurier, form.miejscowosc.value);
      setValue(form.kod_pocztowy_kurier, form.kod_pocztowy.value);
      setValue(form.ulica_kurier, form.ulica.value);
      setValue(form.nr_domu_kurier, form.nr_domu.value);
      setValue(form.nr_lokalu_kurier, form.nr_lokalu.value);

      setValue(form.imie_kurier, form.imie.value);
      setValue(form.nazwisko_kurier, form.nazwisko.value);
      setValue(form.firma_kurier, form.firma.value);
    }

    var currentMenu = 1;
    var wait = false;

    function showMenu(i, scroll, ignoreForm = false) {
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

      if (!ignoreForm) {
        if (i > currentMenu && isFormValid() == false) return;
      }

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
          var view = $('.view_' + scroll);
          if (view) scrollToView(view);
        }, 10);
      }, 200);

      if (i == 3) {
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

    var BASKET_COST = <?= $app["user"]["basket"]["total_basket_cost"] ?>;

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
      var t = $("#total-cost");
      t.innerHTML = (RABAT_TYPE == "static" ? (BASKET_COST - RABAT) : Math.round(BASKET_COST * (1 - 0.01 * RABAT))) + DELIVERY_COST;
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
          <img src="/src/img/basket.png" style="width:22px">
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

        <div class="zamowienie adjustable-list"><?= $res ?></div>

        <div style="margin-top: 30px;">
          <div style="margin-top: 13px;text-align: right;padding: 5px;" class="hideifempty mobileTextCenter">
            <span style="display:inline-block;font-size: 18px;padding: 0 3px;">Wartość koszyka:</span>
            <span style="display:inline-block;font-size: 20px;" class="pln"><span class="total"><?= $app["user"]["basket"]["total_basket_cost"] ?></span> zł</span>

            <p style='font-weight:normal;margin:0;font-size: 1.1em;'>Kurier: <span class="pln"><?= config('kurier_cena', 0) ?> zł</span>, Paczkomat: <span class="pln"><?= config('paczkomat_cena', 0) ?> zł</span>, Odbiór osobisty: <span class="pln">0 zł</span></p>

            <p style='font-weight:normal;margin:0;font-size: 1.1em'>Czas realizacji: <span class="pln">24h</span></p>
          </div>

          <div class="mobile-column" style="display:flex;justify-content: center;flex-wrap:wrap;margin-top: 15px;">
            <?php if (!$app["user"]["id"]) : ?>
              <div>
                <button class="btn primary big" onclick="showModal('loginForm',{source:this});hideLoginFormPassword()" style="max-width: 100%;width:270px;margin-top: 25px;">Zaloguj się <i class="fa fa-user"></i></button>
                <br><br>
                <strong>Co zyskasz?</strong>
                <div>- Dostęp do historii zamówień</div>
                <div>- Zapisanie danych kontaktowych</div>
              </div>
              <div style='margin:12px;margin-top:34px' class="lub-span">lub</div>
            <?php else : ?>
              <div style="flex-grow:1"></div>
            <?php endif ?>
            <div>
              <button class="btn <?= $app["user"]["id"] ? "primary" : "secondary" ?> big" onclick="showMenu(2, undefined, true)" style="margin-top: 25px;min-width:250px">
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
          <!-- <div style="margin:10px 0;text-align:center">
            <a style="display:inline-block;border-bottom: 1px solid #666;color:#666;font-style:italic" href="/koszyk">Chcesz zmienić zawartość koszyka?</a>
          </div> -->


        </div>
      </div>
    </div>

    <!-- <div id="menu2" class="menu mobileRow" style="max-width: 1000px;display:none;">
      <div style="padding:10px">
        <div class="mobileRow" style="margin-top: 20px">
          <div style="width: 50%; margin-top:15px">
            <div style="width:100%;margin:auto;max-width:300px">
              <?php include "user/account/login_form.php"; ?>
            </div>
          </div>
          <div style="width: 50%;margin-top: 15px">
            <div style="width:100%;margin:auto;max-width:300px">
              <h1 class="h1">Bez rejestracji</h1> -->
    <!-- <a href="/rejestracja/zakup" class="btn primary big fill" style="margin-top:20px">
                Zarejestruj się
                <i class="fa fa-user-plus"></i>
              </a>
              <div style="margin: 15px 0 0;background: #ccc;height: 1px;width: 100%;"></div>
              <div style="margin: -10px auto 15px;height:10px;background-color:white;width:50px;text-align:center;font-size: 15px;color: #333;">lub</div> -->
    <!-- <button class="btn secondary big fill" type="button" onclick="showMenu(3)">
                Dalej
                <i class="fa fa-chevron-right"></i>
              </button>
              <div style="margin:25px 0 15px;line-height: 1.6;color: #333;">
                <b>Zalety korzystania z konta <?= config('main_email_sender') ?>:</b>
                <div>- Możliwość przeglądania swoich zamówień</div>
                <div style="display:flex;line-height: 1.3;">
                  <div style='margin-right:3px'>-</div>
                  <div>Zapisanie danych osobowych oraz adresu do przyszłych zamówień</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="margin: 40px auto 0;max-width:780px;display: flex; justify-content: space-between;padding:20px">
          <button class="btn secondary big" type="button" onclick="showMenu(1)" style="margin-top: 10px; display:inline-block;width:220px">
            <i class="fa fa-chevron-left"></i>
            Cofnij
          </button>
        </div>
      </div>
    </div> -->

    <div id="menu2" class="menu" style="max-width: 1200px; display:none">
      <div class="mobileRow">
        <div style="width:100%;padding: 20px 10px;">
          <div style="max-width: 550px;margin: 0 auto;">
            <h3 style="text-align: center;font-size: 26px;padding: 40px 0 20px;;margin: 0;" class="view_kontakt">Dane kontaktowe</h3>

            <div style="display:flex;justify-content:space-evenly;padding:10px">
              <input name="buyer_type" type="hidden" onchange="setBuyerFromInput(this.value)" data-cookie="buyer_type">
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
              <input type="text" class="field" name="imie" autocomplete="first-name" data-validate data-cookie>

              <div class="field-title">Nazwisko</div>
              <input type="text" class="field" name="nazwisko" autocomplete="family-name" data-validate data-cookie>
            </div>

            <div class="expand_y caseFirma hidden animate_hidden">
              <div class="field-title">Nazwa firmy</div>
              <input type="text" class="field" name="firma" autocomplete="organization" data-validate data-cookie>

              <div class="field-title">NIP</div>
              <input type="text" class="field" name="nip" data-validate="nip" data-cookie>
            </div>

            <div class="field-title">Adres e-mail</div>
            <input type="text" class="field" name="email" autocomplete="email" data-validate="email" data-cookie>

            <div class="field-title">Nr telefonu</div>
            <input type="text" class="field" name="telefon" autocomplete="tel" data-validate data-cookie>

            <div class="field-title">Kraj</div>
            <input type="text" class="field" name="kraj" data-validate data-cookie>

            <div class="miejscowosc-picker-wrapper">
              <div class="field-title">Kod pocztowy</div>
              <input type="text" class="field" name="kod_pocztowy" autocomplete="postal-code" onchange="kodPocztowyChange(this)" data-validate data-cookie>

              <div class="field-title">Miejscowość</div>
              <input class="field miejscowosc-picker-target" type="text" name="miejscowosc" autocomplete="address-level2" placeholder=" " data-validate data-cookie>
              <div class="miejscowosc-picker-list"></div>
            </div>

            <div class="field-title">Ulica</div>
            <input type="text" class="field" name="ulica" autocomplete="address-line1" data-validate data-cookie>

            <div class="desktopRow spaceColumns">
              <div>
                <div class="field-title">Nr domu</div>
                <input type="text" class="field" name="nr_domu" autocomplete="address-line2" data-validate data-cookie>
              </div>
              <div>
                <div class="field-title">Nr lokalu</div>
                <input type="text" class="field" name="nr_lokalu" autocomplete="address-line3" data-cookie>
              </div>
            </div>
          </div>
        </div>

        <div style="width:100%;padding: 20px 10px;">
          <div style="max-width: 550px;margin: 0 auto;">
            <h3 style="text-align: center;font-size: 26px;padding: 40px 0 20px;;margin: 0;" class="view_dostawa">Rodzaj dostawy</h3>

            <input id="dostawaInput" name="dostawa" type="hidden" onchange="selectDostawaFromInput(this.value)" data-cookie />
            <input name="paczkomat" type="hidden" data-cookie="paczkomat">

            <div>
              <div class="dostawa" id="kurier-option" onclick="selectDostawa(this.id)">
                <img src="/img/courier.png" style="width:40px"> <span>Kurier</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">+<?= config('kurier_cena', 0) ?> zł</span>
              </div>

              <div class="dostawa" id="paczkomat-option" onclick="showPaczkomatPicker()">
                <img src="/img/inpost_logo.png" style="width:60px"> <span>Paczkomat</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">+<?= config('paczkomat_cena', 0) ?> zł</span>
              </div>

              <div class="dostawa" id="osobiscie-option" onclick="selectDostawa(this.id)">
                <i class="fa fa-user" style="font-size: 26px;margin: 4px;"></i> <span>Odbiór osobisty</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">0 zł</span>
                <input name="oddzial_id" value="0" type="hidden" data-cookie>
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
                <h3 style="text-align: center;font-size: 26px;margin: 15px 0 15px;" class="view_adres">Adres dostawy</h3>

                <button class="btn primary medium" type="button" onclick="copyAdres()" style="width:auto;margin:0 auto 10px;display:block"><i class="fa fa-copy"></i> Przepisz moje dane</button>

                <div class="field-title">Imię</div>
                <input type="text" class="field" name="imie_kurier" autocomplete="first-name" data-validate data-cookie>

                <div class="field-title">Nazwisko</div>
                <input type="text" class="field" name="nazwisko_kurier" autocomplete="family-name" data-validate data-cookie>

                <div class="field-title">Nazwa firmy <i style="font-size: 0.8em;color: #666;font-style: normal;">(opcjonalnie)</i></div>
                <input type="text" class="field" name="firma_kurier" autocomplete="organization" data-cookie>

                <div class="field-title">Kraj</div>
                <input type="text" class="field" name="kraj_kurier" data-validate data-cookie>

                <div class="miejscowosc-picker-wrapper">
                  <div class="field-title">Kod pocztowy</div>
                  <input type="text" class="field" name="kod_pocztowy_kurier" autocomplete="postal-code" onchange="kodPocztowyChange(this)" data-validate data-cookie>

                  <div class="field-title">Miejscowość</div>
                  <input class="field miejscowosc-picker-target" type="text" name="miejscowosc_kurier" autocomplete="address-level2" placeholder=" " data-validate data-cookie>
                  <div class="miejscowosc-picker-list"></div>
                </div>

                <div class="field-title">Ulica</div>
                <input type="text" class="field" autocomplete="address-line1" name="ulica_kurier" data-validate data-cookie>

                <div class="desktopRow spaceColumns">
                  <div>
                    <div class="field-title">Nr domu</div>
                    <input type="text" class="field" autocomplete="address-line2" name="nr_domu_kurier" data-validate data-cookie>
                  </div>
                  <div>
                    <div class="field-title">Nr lokalu</div>
                    <input type="text" class="field" autocomplete="address-line3" name="nr_lokalu_kurier" data-cookie>
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
                <input type="text" name="imie_dostawa">
                <input type="text" name="nazwisko_dostawa">
                <input type="text" name="firma_dostawa">
                <input type="text" name="kraj_dostawa">
                <input type="text" name="kod_pocztowy_dostawa">
                <input type="text" name="miejscowosc_dostawa">
                <input type="text" name="ulica_dostawa">
                <input type="text" name="nr_domu_dostawa">
                <input type="text" name="nr_lokalu_dostawa">
              </div>
            </div>
          </div>
        </div>
      </div>


      <div style="padding: 10px;display: flex;justify-content: space-between;max-width: 1170px;margin: 0 auto;width: 100%;">
        <button class="btn secondary big desktopSpaceRight btn secondary" type="button" onclick="showMenu(1)" style="margin-top: 30px; display:inline-block;width:220px">
          <i class="fa fa-chevron-left"></i>
          Cofnij
        </button>
        <button class="btn primary big" type="button" onclick="showMenu(3)" style="margin-top: 30px; display:inline-block;width:220px">
          Dalej
          <i class="fa fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div id="menu3" class="menu mobileRow podsumowanie" style="max-width: 1100px; display:none;padding:20px 0">
      <h3 style="text-align: center;font-size: 26px;padding: 40px 0 20px;;margin: 0;">Podsumowanie</h3>
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

          <input name="forma_zaplaty" type="hidden" data-cookie="forma_zaplaty">
          <input name="impersonate" type="hidden" value="<?= $impersonate ?>">


        </div>
        <div style="width: 100%;margin: 0 auto;padding: 10px;">
          <h4>Produkty</h4>

          <div class="zamowienie"><?= $res ?></div>

          <div class="mobileRow" style="justify-content:space-between;margin-top: 10px;">
            <label style="margin:10px 0">
              <?php if ($app["user"]["id"]) : ?>
                <div id="rabat_hide">
                  <span>Kod rabatowy</span>
                  <div style="display:flex">
                    <input type="text" id="kod_rabatowy" class="field">
                    <button type="button" style="margin-left:-1px;width: auto;font-size: 15px;" class="btn primary big" onclick="aktywujKodRabatowy('add')">Aktywuj</button>
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
              <b style="display:inline-block;font-size: 20px;"><span id="total-cost" style="display:inline-block;" class="pln"><?= $app["user"]["basket"]["total_basket_cost"] ?></span> zł</b>
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

          <label class="checkbox-wrapper field-title" onclick="$('#regulamin-warn').style.display='none'">
            <input type="checkbox" id="accept-regulamin">
            <div class="checkbox"></div>
            Akceptuję <a href="/regulamin" target="_blank" style="font-weight: bold;color: var(--primary-clr);text-decoration: underline;">REGULAMIN</a> <span style="color:red;font-weight: bold;display:none" id="regulamin-warn"> Wymagane*</span>
          </label>


          <div class="mobileRow" style="align-items:flex-start">
            <p style="font-size: 15px;">Zostaniesz przeniesiony do strony płatności <img src="/img/p24.png" style="width: 100px;vertical-align: bottom;transform: translateY(4px);"></p>
            <!--<div id="hideOnSuccess">
                <div id="casegpay" style="display:none;margin-bottom: 5px;">Zapłać za pomocą <img src="/img/gpay.png" style="display: inline-block;width: 40px;vertical-align: bottom;margin-left: 2px;">:</div>
                <div id="payment-request-button"></div>
              </div>-->

            <button onclick="confirmOrder()" class="btn primary big" style="margin-top: 10px;width: 260px;margin-left:auto">
              <span id="submit_text">ZAMAWIAM I PŁACĘ</span>
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>

      </div>

      <div style="padding: 10px">
        <button class="btn secondary big pullHigherDesktop" type="button" onclick="showMenu(2)" style="display:inline-block;width:170px">
          <i class="fa fa-chevron-left"></i>
          Cofnij
        </button>
      </div>

    </div>

  </div>
  <?php include "global/footer.php"; ?>
</body>

</html>