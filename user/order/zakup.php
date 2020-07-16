<?php //->[zakup]

$basket = json_decode($_SESSION["basket"],true);
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

if ($app["user"]["id"])
{
  //$user_data = fetchRow("SELECT imie, nazwisko, email, telefon, firma, nip, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu FROM `users` WHERE user_id = ".intval($app["user"]["id"]));
  $user_data = fetchRow("SELECT * FROM users WHERE user_id = ".intval($app["user"]["id"]));

  // rewrite empty
  foreach ($user_data as $key => $value) {
    if (!trim($value)) continue;

    if (isset($zamowienie_data[$key])) {
      $zamowienie_data[$key] = $value;
    }
  }
}

$parts = explode("/",$url);
$impersonate = 0;
if (isset($parts[1]) && strlen($parts[1]) > 5)
{
  $zamowienie_link = $parts[1];
  // $zamowienie_data = fetchRow("SELECT zamowienie_id, user_id, user_type, basket, koszt, zlozono, oplacono, nip, status, imie, nazwisko, email, telefon, firma, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu, dostawa, uwagi, koszt_dostawy, session_id, rabat, kod_pocztowy_z, miejscowosc_z, kraj_z, ulica_z, nr_domu_z, nr_lokalu_z,  imie_d, nazwisko_d, firma_d, buyer_type FROM zamowienia LEFT JOIN users USING (user_id) WHERE link = ?", $zamowienie_link);
  $zamowienie_data = fetchRow("SELECT *, z.basket, z.imie, z.nazwisko, z.email, z.telefon, z.nip, z.kraj, z.miejscowosc, z.ulica, z.kod_pocztowy, z.nr_domu, z.nr_lokalu FROM zamowienia z LEFT JOIN users USING (user_id) WHERE link = ?", [$zamowienie_link]);

  $basket_swap = json_decode($zamowienie_data["basket"], true);
  $basket = [];
    if ($basket_swap) {
    foreach ($basket_swap as $b) {
      $basket[$b['v']] = $b['q'];
    }
  }
  $_SESSION["basket"] = json_encode($basket);
  
  unset($_SESSION["kod"]);
  $_SESSION["rabat"] = $zamowienie_data["rabat"];
  $_SESSION["user_id_impersonate"] = nonull($zamowienie_data,"user_id",null);
  $_SESSION["user_type_impersonate"] = nonull($zamowienie_data,"user_type",null);
  $impersonate = 1;
}
else
{
  
}

// validate stock

require "get_basket_data.php";

require "helpers/validate_stock.php";

$res = "";
$empty = true;
if (empty($basket))
{
  $res = "<h3 style='text-align:center'>Twój koszyk jest pusty!</h3>";
}
else
{
  require "print_basket_nice.php";
}

if ($empty && !isset($_GET['produkt']))
{
  header("Location: /");
  die;
}

if (!$totalBasketCost) $totalBasketCost = 0;

?>

<!DOCTYPE html>
<html lang="pl">
  <head>
    <title>Zakup</title>
    <script async src="/src/inpost_map.js"></script>
    <link rel="stylesheet" href="/src/inpost_map.css"/>
    <?php include "includes.php"; ?>
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
        /*color: #60c216;
        font-weight: bold;
        border-color: #60c216;*/
        color: white;
        background: #60c216;
        border-color: #60c216;
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
      .items > div {
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
        .table > div {
          flex-direction: column;
        }
        .table > div > div:nth-child(2) {
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
        .mobileRow > .dostawa {
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
      .menu:not(.showNow)
      {
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
        background-color: #60c216 !important;
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

      .progress-item.current ~ .progress-item:after {
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

      .progress-item.current ~ .progress-item .progress-count {
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

      .progress-item:first-child:before, .progress-item:last-child:before {
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
      }

      @media only screen and (max-width: 350px) {
        .progress-item {
          min-width: 80px;
        }
      }

      .progress-item.current {
        pointer-events: none;
      }

      @keyframes fadeOut {
        0% {opacity: 1}
        25% {opacity: 0}
        100% {opacity: 1}
      }

      /* progress-bar end */
    </style>
    <script>

      window.addEventListener("DOMContentLoaded",function(){
        window.form = document.getElementById("form");

        ignoreValueChanges = true;
        loadFormData(<?=json_encode($zamowienie_data)?>, elem(".main-container"));
        ignoreValueChanges = false;

        <?php //if (!$app["user"]["id"]) { ?>
          //loadFormFromCookies();
        <?php //} ?>
        setTimeout(()=>{
          loadFormFromCookies();
        });
        

        if (BASKET_COST == 0) {
          document.querySelectorAll("btn primary big").forEach((e)=>{e.style.display = "none"});
        }

        if (RABAT > 0) hasKodRabatowy({kwota:RABAT,type:RABAT_TYPE});

        document.getElementById("form").addEventListener('keypress', function (e) {
          if (e.key=='Enter' && e.target.tagName != "TEXTAREA") {
            e.preventDefault();
            return false;
          }
        });

        <?php if (isset($_SESSION["just_logged"])) { unset($_SESSION["just_logged"]); ?>
          showMenu(3);
        <?php } ?>

        document.querySelectorAll(".progress-item[data-id]").forEach(e=>{
          e.addEventListener("click",()=>{
            showMenu(e.getAttribute("data-id"));
          });
        });

        document.querySelectorAll(`[name*="_kurier"]`).forEach(e => {
          e.addEventListener("change", () => {
            var name = e.getAttribute("name").replace("_kurier","_dostawa");
            var input = form.querySelector(`input[name="${name}"]`);
            if (input) {
              setValue(input, e.value);
            }
          });
        });
      });

      function addItem(diff,variant_id)
      {
        if (diff == 1)
          url = "/basket/add/"+variant_id+"/"+1;
        else
          url = "/basket/remove/"+variant_id+"/"+1;

        xhr({
          url: url,
          params: {
            html: true
          },
          success: (res) => {
            res  = JSON.parse(res);
            if (!res.html)
            {
              res.html = `
                <div style="text-align:center">
                <h3>Koszyk jest pusty!</h3>
                <a class="btn primary big" href="/" style='width: 220px'>
                  Rozpocznij zakupy
                  <i class="fa fa-chevron-right"></i>
                </a></div>`;
              
              document.querySelectorAll("button, .hideifempty").forEach((e)=>{
                e.style.display = "none";
              });
            }

            BASKET_COST = res.totalBasketCost;
            document.querySelectorAll(".zamowienie").forEach((e)=>{
              removeContent(e);
              e.insertAdjacentHTML("afterbegin", res.html);
            });

            document.querySelectorAll(`[data-variant_id="${variant_id}"]`).forEach(v => {
              v.style.animation = "fadeOut 0.5s";
            });

            document.querySelectorAll(".total").forEach((e)=>{
              e.innerHTML = BASKET_COST;
            });
            updateTotalCost();
          }
        });
      }



      function isFormValid()
      {        
        if (currentMenu == 4)
        {
          if (!document.getElementById("accept-regulamin").checked)
          {
            document.getElementById("regulamin-warn").style.display = "inline-block";
            return false;
          }
        }

        return validateForm({form:elem("#menu"+currentMenu)});
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
      function showMenu(i,scroll)
      {
        if (i-currentMenu > 1) {
          i = +currentMenu + 1;
        }
        if (i-currentMenu < -1) {
          i = +currentMenu - 1;
        }

        <?php if ($app["user"]["id"]) { ?>
          if (i == 2) i = 2*i-currentMenu;
        <?php } ?>


        if (wait || currentMenu == i) return;

        if (i > currentMenu && isFormValid() == false) return;

        var wasMenu = currentMenu;
        currentMenu = i;

        removeClasses("current",".progress-item");
        var progressItem = elem(`.progress-item[data-id="${currentMenu}"]`);
        if (progressItem) {
          progressItem.classList.add("current");
        }

        wait = true;
        var was = elem("#menu"+wasMenu);
        var now = elem("#menu"+i);
        was.classList.remove("showNow");
        document.getElementById("menu"+i).style.display = "flex";
        now.style.position = "fixed";
        now.style.height = "";
        setTimeout(function(){
          was.style.display = "none";
          now.classList.add("showNow");
          now.style.position = "";
          wait = false;

          setTimeout(function(){
            var view = elem('.view_'+scroll);
            if (view) scrollToView(view);
          },10);
        },200);

        if (i == 4) {
          var form = document.getElementById("form");

          var daneKontaktoweInfo = "";
          if (BUYER_TYPE == 'p') {
            daneKontaktoweInfo = form.imie.value + " " + form.nazwisko.value;
          }
          else {
            daneKontaktoweInfo = form.firma.value + "<br>NIP:&nbsp;" + form.nip.value;
          }
          daneKontaktoweInfo += "<br>" + form.telefon.value + "<br>" + form.email.value;

          daneKontaktoweInfo += '<div style="height: 7px;"></div>' + form.kod_pocztowy.value + " " + form.miejscowosc.value + ", " + form.kraj.value + "<br>" + form.ulica.value + " " + form.nr_domu.value + (form.nr_lokalu.value ? "/" : "") + form.nr_lokalu.value;

          document.getElementById("daneKontaktoweInfo").innerHTML = daneKontaktoweInfo;

          if (document.getElementById("dostawaRodzaj").innerHTML == "Paczkomat")
          {
            document.getElementById("adresInfo").innerHTML = document.getElementById("paczkomatAdres").innerHTML;

            DELIVERY_COST = <?= config('paczkomat_cena',0) ?>;
          }
          else if (document.getElementById("dostawaRodzaj").innerHTML == "Kurier")
          {
            /*form.kraj_dostawa.value = form.kraj.value;
            form.miejscowosc_dostawa.value = form.miejscowosc.value;
            form.kod_pocztowy_dostawa.value = form.kod_pocztowy.value;
            form.ulica_dostawa.value = form.ulica.value;
            form.nr_domu_dostawa.value = form.nr_domu.value;
            form.nr_lokalu_dostawa.value = form.nr_lokalu.value;*/

            DELIVERY_COST = <?= config('kurier_cena',0) ?>;
          }
          else
          {
            DELIVERY_COST = 0;
          }

          var adresInfo = "";

          if (document.getElementById("dostawaRodzaj").innerHTML == "Kurier") {
            adresInfo += form.imie_dostawa.value + " " + form.nazwisko_dostawa.value + (form.firma_dostawa.value == '' ? '' : "<br>" + form.firma_dostawa.value)
                      + '<span style="height: 7px;display:block"></span>'
          }

          adresInfo += (form.paczkomat.value ? ("Paczkomat " + form.paczkomat.value + "<br>") : "") +
            form.ulica_dostawa.value + " " + form.nr_domu_dostawa.value + (form.nr_lokalu_dostawa.value ? "/" : "") + form.nr_lokalu_dostawa.value
            + "<br>" + form.kod_pocztowy_dostawa.value + " " + form.miejscowosc_dostawa.value + ", " + form.kraj_dostawa.value;
            
          document.getElementById("adresInfo").innerHTML = adresInfo;

          var forma_zaplaty = "po";
          if (document.getElementById("p24").checked)
          {
            forma_zaplaty = "24";
          }

          form.forma_zaplaty.value = forma_zaplaty;

          document.getElementById("submit_text").innerHTML = forma_zaplaty == "po" ? "POTWIERDZAM ZAMÓWIENIE" : "ZAMAWIAM I PŁACĘ";

          document.getElementById("zaplataInfo").innerHTML = document.getElementById("forma_"+forma_zaplaty).innerHTML.replace(/<input.*>/,"");

          document.getElementById("koszt_dostawy_label").innerHTML = DELIVERY_COST + " zł";

          if (document.getElementById("dostawaRodzaj").innerHTML == "Kurier")
          {
            document.querySelector("#estimatedDelivery").style.display = "block";
          }
          else
          {
            document.querySelector("#estimatedDelivery").style.display = "none";
          }
          
          updateTotalCost();
        }
      }

      var firstPaczkomat = true;
      function showPaczkomatPicker()
      {
        document.querySelector("html").style.overflowY = "hidden";
        if (firstPaczkomat)
        {
          window.easyPackAsyncInit = function () {
            easyPack.init({});
            var map = easyPack.mapWidget('easypack-map', function(point){
                hidePaczkomatPicker();
                selectDostawa("paczkomat-option", false);

                loadFormData({
                  paczkomat: point.name,
                  kraj_dostawa: "Polska",
                  miejscowosc_dostawa: point.address_details.city,
                  kod_pocztowy_dostawa: point.address_details.post_code,
                  ulica_dostawa: point.address_details.street,
                  nr_domu_dostawa: point.address_details.building_number,
                  nr_lokalu_dostawa: ""
                }, elem(".main-container"));
                
                document.getElementById("paczkomatAdres").innerHTML = "Paczkomat "+form.paczkomat.value+"<br>"+form.ulica_dostawa.value+" "+form.nr_domu_dostawa.value+"<br>"+form.kod_pocztowy_dostawa.value+" "+form.miejscowosc_dostawa.value+" Polska";

                document.getElementById("dostawaRodzaj").innerHTML = "Paczkomat";
                setValue(elem("#dostawaInput"),"p");
            });
          };
          firstPaczkomat = false;
        }
        var picker = document.getElementById('paczkomat-picker');
        picker.style.display = "block";
        setTimeout(function(){picker.classList.add('paczkomat-picker-open');},0);
      }

      function expandOneDostawa(dostawa) {
        expand(elem("#casePaczkomat"), dostawa == "paczkomat");
        expand(elem("#caseKurier"), dostawa == "kurier");
        expand(elem("#caseOsobiscie"), dostawa == "osobiscie");  
      }
      
      var BUYER_TYPE = '<?=$zamowienie_data["buyer_type"]?>';

      function setBuyerFromInput(value) {
        if (value) {
          if (value == "p") {
            elem("#priv").checked = true;
          }
          else {
            elem("#comp").checked = true;
          }
        }
        setBuyer(false);
      }
      function setBuyer(user = true)
      {
        BUYER_TYPE = elem("#priv").checked ? "p" : "f";
        if (user) {
          setValue(elem(`[name="buyer_type"]`), BUYER_TYPE);
        }
        elem("#casePerson").classList.toggle("expanded", BUYER_TYPE=='f');
        document.querySelectorAll(".caseFirma").forEach((e)=>{
          e.classList.toggle("expanded", BUYER_TYPE=='f');
        });

        expand(elem("#casePerson"), BUYER_TYPE=='p');
        expand(elem(".caseFirma"), BUYER_TYPE=='f');
      }

      function hidePaczkomatPicker()
      {
        document.querySelector("html").style.overflowY = "auto";
        var picker = document.getElementById('paczkomat-picker');
        picker.classList.remove('paczkomat-picker-open');
        setTimeout(function(){picker.style.display = "none"},300);
      }

      function selectDostawaFromInput(value) {
        if (value == "k") {
          selectDostawa("kurier-option", false);
        }
        else if (value == "p") {
          selectDostawa("paczkomat-option", false);
          
          expandOneDostawa("paczkomat");
          
          setTimeout(()=>{
            document.getElementById("paczkomatAdres").innerHTML = "Paczkomat "+form.paczkomat.value+"<br>"+form.ulica_dostawa.value+" "+form.nr_domu_dostawa.value+"<br>"+form.kod_pocztowy_dostawa.value+" "+form.miejscowosc_dostawa.value+" Polska";
          },100);
        }
        else if (value == "o") {
          selectDostawa("osobiscie-option", false);
        }
      }

      function selectDostawa(id, user = true)
      {
        dostawaInput = "k"; // default

        if (id != 'paczkomat-option') {
          form.paczkomat.value = "";
        }

        if (id == 'kurier-option')
        {
          document.getElementById("dostawaRodzaj").innerHTML = "Kurier";
          dostawaInput = "k";          

          expandOneDostawa("kurier");

          document.querySelectorAll(`[name*="_kurier"]`).forEach(e => {
            e.dispatchEvent(new Event("change"));
          });
        }
        else if (id == 'osobiscie-option')
        {
          loadFormData({
            kraj_dostawa: "Polska",
            miejscowosc_dostawa: "Warszawa",
            kod_pocztowy_dostawa: "01-460",
            ulica_dostawa: "Górczewska",
            nr_domu_dostawa: "216",
            nr_lokalu_dostawa: ""
          }, elem(".main-container"));

          document.getElementById("dostawaRodzaj").innerHTML = "Odbiór osobisty";
          dostawaInput = "o";

          expandOneDostawa("osobiscie");
        }

        var previous = document.querySelector(".selectedDostawa");
        if (previous)
          previous.classList.remove("selectedDostawa");

        document.getElementById(id).classList.add("selectedDostawa");

        if (user) {
          setValue(elem("#dostawaInput"),dostawaInput);
        }
      }

      function aktywujKodRabatowy(action) {
        ajax('/validate_kod_rabatowy',{
          code: document.getElementById("kod_rabatowy").value,
          action: action
        },(response)=>{
          if (action == "remove")
          {
            hasKodRabatowy(null);
          }
          else
          {
            response = JSON.parse(response);
            if (response.success)
            {
              hasKodRabatowy(response);
            }
            else
            {
              document.getElementById("kod_rabatowy").style.borderColor = "red";
              document.getElementById("kod_rabatowy_reason").innerHTML = response.error;
            }
          }
        },null);
      }

      var DELIVERY_COST = 0;

      var RABAT = <?= isset($_SESSION["rabat"]) ? $_SESSION["rabat"] : 0 ?>;
      var RABAT_TYPE = "<?= isset($_SESSION["rabat_type"]) ? $_SESSION["rabat_type"] : "static" ?>";
      
      var BASKET_COST = <?= str_replace(",",".",$totalBasketCost) ?>;
      function hasKodRabatowy(rabat) {
        if (rabat) {
          RABAT = rabat.kwota;
          RABAT_TYPE = rabat.type;
        }
        else {
          RABAT = 0;
          RABAT_TYPE = "static";
        }

        if (rabat == 0)
        {
          document.getElementById("kod_rabatowy_wrapper").style.display = "none";
          document.getElementById("rabat_hide").style.display = "block";
        }
        else
        {
          document.getElementById("kod_rabatowy").style.borderColor = "";
          document.getElementById("kod_rabatowy_wrapper").style.display = "block";
          document.getElementById("kod_rabatowy_label").innerHTML = "-" + RABAT + (RABAT_TYPE == "static" ? "zł" : "%");
          document.getElementById("rabat_hide").style.display = "none";
        }

        updateTotalCost();
      }

      function updateTotalCost() {
        var t = document.getElementById("total-cost");
        t.innerHTML = (RABAT_TYPE == "static" ? (BASKET_COST-RABAT) : Math.round(BASKET_COST*(1-0.01*RABAT))) + DELIVERY_COST;
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

    <form action="/login" method="post" style="display:none" id="zaloguj">
      <input type="text" name="email">
      <input type="password" name="password">
    </form>

    <div class="progress-bar-wrapper">
      <div class="progress-bar">
        <div class="progress-item current" data-id="1">
          <span class="progress-count"><?= ++$progressBarCounter?></span>
          <span class="progress-title">
            <img src="/src/img/basket.png" style="width:22px">
            <span>Koszyk</span>
          </span>
        </div>
        
        <?php if (!$app["user"]["id"]) : ?>

          <div class="progress-item" data-id="2">
            <span class="progress-count"><?= ++$progressBarCounter?></span>
            <span class="progress-title">
            <i class="far fa-user" style="font-size: 24px"></i>
              <span>
                Wybór konta
              </span>
            </span>
          </div>

        <?php endif ?>

        <div class="progress-item" data-id="3">
          <span class="progress-count"><?= ++$progressBarCounter?></span>
          <span class="progress-title">
            <img src="/img/courier.png" style="width:36px">
            <span>
              Dane do wysyłki
            </span>
          </span>
        </div>

        <div class="progress-item" data-id="4">
          <span class="progress-count"><?= ++$progressBarCounter?></span>
          <span class="progress-title">
            <i class="far fa-check-square" style="font-size: 24px"></i>
            <span> Podsumowanie</span>
          </span>
        </div>
      </div>
    </div>

    <form class="main-container" action="/potwierdz_zamowienie" method="post" id="form" style="margin-bottom: 50px;width: 100%;" onsubmit="return isFormValid()">
    
      <div id="menu1" class="menu showNow" style="max-width: 1000px;">
        <div style="margin: auto;width:100%;padding: 20px 10px;">

          <?php if (isset($_GET['produkt'])) : ?>
            <h3 style="margin:20px;color:red;text-align:center">Niestety produkt został już wyprzedany!<br><span style="font-weight: normal;">Musisz zmienić zawartość koszyka</span></h3>
          <?php endif ?>

          <h3 style="text-align: center;font-size: 26px;padding: 40px 0 20px;;margin: 0;">Twój koszyk</h3>

          <div class="zamowienie adjustable-list"><?= $res ?></div>

          <div style="margin-top: 30px;text-align:center">
            <div style="margin-top: 13px;text-align: right;padding: 5px;" class="hideifempty mobileTextCenter">
              <span style="display:inline-block;font-size: 18px;padding: 0 3px;">Wartość koszyka:</span>
              <span style="display:inline-block;font-size: 20px;" class="pln"><span class="total"><?= $totalBasketCost ?></span> zł</span>

              <p style='font-weight:normal;margin:0;font-size: 1.1em;'>Kurier: <span class="pln"><?= config('kurier_cena',0) ?> zł</span>, Paczkomat: <span class="pln"><?= config('paczkomat_cena',0) ?> zł</span>, Odbiór osobisty: <span class="pln">0 zł</span></p>

              <p style='font-weight:normal;margin:0;font-size: 1.1em'>Czas realizacji: <span class="pln">24h</span></p>
            </div>
            <div style="margin:10px 0;text-align:center">
              <!--<a style="display:inline-block;border-bottom: 1px solid #666;color:#666;font-style:italic" href="/koszyk">Chcesz zmienić zawartość koszyka?</a>-->
            </div>

            <div class="sameButtons" style="margin-top: 40px;text-align:right;">
              <button class="btn primary big" type="button" onclick="showMenu(2)" style="margin-top: 30px;width:200px; display:inline-block;">
                Złóż zamówienie
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>
          </div>
          </div>
      </div>

      <div id="menu2" class="menu mobileRow" style="max-width: 1000px;display:none;">
        <div style="padding:10px">
          <div class="mobileRow" style="margin-top: 20px">
            <div style="width: 50%; margin-top:15px">
              <div style="width:100%;margin:auto;max-width:300px">
                <h2 style="text-align:center">Mam konto</h2>
                <?php
                  if (isset($_POST["message"]))
                    echo "<div style='text-align:center; padding: 5px'><h3 style='color: #c44;display: inline-block;border: 1px solid #c44;padding: 7px;margin: 0 auto;border-radius: 5px;'>{$_POST["message"]}</h3></div>";
                ?>
                <div class="field-title">E-mail</div>
                <input type="text" class="field" autocomplete="username" onchange="document.getElementById('zaloguj').email.value = this.value">
                <div class="field-title">Hasło</div>
                <input type="password" class="field" autocomplete="password" onchange="document.getElementById('zaloguj').password.value = this.value">
                <button class="btn primary big fill" type="button" style="margin:10px 0; width: 100%" onclick="document.getElementById('zaloguj').submit()">
                  Zaloguj się
                  <i class="fa fa-chevron-right"></i>
                </button>

                <div style="text-align: center;margin-top: 5px;">lub</div>
                <div class="g-signin2" data-onsuccess="onSignIn"></div>

                <?=$fb_login_btn?>
              </div>
            </div>
            <div style="width: 50%;margin-top: 15px">
              <div style="width:100%;margin:auto;max-width:300px">
                <h2 style="text-align:center">Nie mam konta</h2>
                <a href="/rejestracja/zakup" class="btn primary big fill" style="margin-top:20px">
                  Zarejestruj się
                  <i class="fa fa-user-plus"></i>
                </a>
                <div style="margin: 15px 0 0;background: #ccc;height: 1px;width: 100%;"></div><div style="margin: -10px auto 15px;height:10px;background-color:white;width:50px;text-align:center;font-size: 15px;color: #333;">lub</div>
                <button class="btn primary big fill" type="button" onclick="showMenu(3)">
                  Zakupy bez rejestracji
                  <i class="fa fa-chevron-right"></i>
                </button>
                <div style="margin:25px 0 15px;line-height: 1.6;color: #333;">
                  <b>Zalety korzystania z konta <?=config('main_email_sender')?>:</b>
                  <div>- Możliwość przeglądania Twoich zamówień</div>
                  <div style="display:flex;line-height: 1.3;"><div style='margin-right:3px'>-</div><div>Zapisanie danych osobowych oraz adresu do przyszłych zamówień</div></div>
                </div>
              </div>
            </div>
          </div>

          <div class="sameButtons" style="margin: 40px auto 0;max-width:780px;display: flex; justify-content: space-between;padding:20px">
            <button class="btn secondary big" type="button" onclick="showMenu(1)" style="margin-top: 10px; display:inline-block;width:220px">
              <i class="fa fa-chevron-left"></i>
              Cofnij
            </button>
          </div>
        </div>
      </div>

      <div id="menu3" class="menu" style="max-width: 1200px; display:none">
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

              <div id="casePerson" class="expandY">
                <div class="field-title">Imię</div>
                <input type="text" class="field" name="imie" autocomplete="first-name" data-validate data-cookie>

                <div class="field-title">Nazwisko</div>
                <input type="text" class="field" name="nazwisko" autocomplete="family-name" data-validate data-cookie>
              </div>

              <div class="expandY caseFirma hidden">
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

              <input id="dostawaInput" name="dostawa" type="hidden" onchange="selectDostawaFromInput(this.value)" data-cookie/>
              <input name="paczkomat" type="hidden" data-cookie="paczkomat">

              <div>
                <div class="dostawa" id="kurier-option" onclick="selectDostawa(this.id)">
                  <img src="/img/courier.png" style="width:40px"> <span>Kurier</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">+<?= config('kurier_cena',0) ?> zł</span>
                </div>

                <div class="dostawa" id="paczkomat-option" onclick="showPaczkomatPicker()">
                  <img src="/img/inpost_logo.png" style="width:60px"> <span>Paczkomat</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">+<?= config('paczkomat_cena',0) ?> zł</span>
                </div>

                <div class="dostawa" id="osobiscie-option" onclick="selectDostawa(this.id)">
                  <i class="fa fa-user" style="font-size: 26px;margin: 4px;"></i> <span>Odbiór osobisty</span> <span class="pln" style="margin-left:10px;font-size: 1.1em;">0 zł</span>
                  <input name="oddzial_id" value="0" type="hidden" data-cookie>
                </div>
              </div>

              <div style="min-height: 120px;">
                <div id="casePaczkomat" class="expandY hidden" style="margin:10px 0;display: flex;flex-direction:column;justify-content:center;min-height: 100px;">
                  <div style="display:flex;justify-content:center;font-size:18px;line-height:1.3;">
                    <div id="paczkomatAdres">

                    </div>
                  </div>
                </div>

                <div id="caseKurier" class="expandY hidden">
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

                <div id="caseOsobiscie" class="expandY hidden" style="min-height: 100px;margin-top:30px">
                  <?php include "mapa.php"; ?>
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

        
        <div class="sameButtons" style="padding: 10px;display: flex;justify-content: space-between;max-width: 1170px;margin: 0 auto;width: 100%;">
          <button class="btn primary big desktopSpaceRight btn secondary" type="button" onclick="showMenu(2)" style="margin-top: 30px; display:inline-block;width:220px">
            <i class="fa fa-chevron-left"></i>
            Cofnij
          </button>
          <button class="btn primary big" type="button" onclick="showMenu(4)" style="margin-top: 30px; display:inline-block;width:220px">
            Dalej
            <i class="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div id="menu4" class="menu mobileRow podsumowanie" style="max-width: 1100px; display:none;padding:20px 0">
        <h3 style="text-align: center;font-size: 26px;padding: 40px 0 20px;;margin: 0;">Podsumowanie</h3>
        <div class="mobileRow">
          
          <div style="width:100%;max-width: 300px; margin: 0 auto;padding: 10px;" class="noMaxWidthMobile">

            <h4>Dane kontaktowe <button type="button" class="btn primary" onclick="showMenu(3,'kontakt')">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button></h4>

            <p id="daneKontaktoweInfo"></p>

            <h4>Rodzaj dostawy <button type="button" class="btn primary" onclick="showMenu(3,'dostawa')">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button></h4>

            <p id="dostawaRodzaj"></p>

            <h4>Adres dostawy <button type="button" class="btn primary" onclick="showMenu(3,'adres')">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button></h4>

            <p id="adresInfo"></p>

            <h4>Forma zapłaty <!--<button type="button" class="btn primary" onclick="showMenu(3)">Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button>--></h4>

            <p id="zaplataInfo"></p>

            <!--<input id="adresInfoInput" name="adresInfo" type="hidden">-->

            <input name="forma_zaplaty" type="hidden" data-cookie="forma_zaplaty">
            <input name="impersonate" type="hidden" value="<?=$impersonate?>">
            

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
                      <input type="text" id="kod_rabatowy">
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
                <span style="font-size: 15px;display:none;color: #4b0;font-weight: bold;" id="kod_rabatowy_wrapper">
                <button type="button" onclick="aktywujKodRabatowy('remove')" style="cursor:pointer;font-weight: bold;margin-right: 5px;font-size: 11px;line-height: 0;width: 18px;height: 18px;border: none;background: #eee;color: #777;vertical-align: text-top;padding: 0;"><i class="fa fa-times"></i></button>
                KOD RABATOWY <span class="pln" id="kod_rabatowy_label"></span></span>
                <span style="display:inline-block;font-size: 16px;padding: 0 3px;">Całkowity koszt zamówienia:</span>
                <b style="display:inline-block;font-size: 20px;"><span id="total-cost" style="display:inline-block;" class="pln"><?= $totalBasketCost ?></span> zł</b>
              </div>
            </div>

            <div id="estimatedDelivery" style="display:none">
              <h4>Przewidywany termin dostarczenia przesyłki</h4>
              <p class="label"><?php 
                if (date("H")<13)
                {
                  $date = date("Y-m-d", time() + 3600 * 24);
                }
                else
                {
                  $date = date("Y-m-d", time() + 3600 * 24 * 2);
                }
                echo niceDate($date);
              ?></p>
            </div>

            <h4 style="margin-top: 40px">Twoje uwagi dotyczące zamówienia</h4>
            <textarea name="uwagi" style="width: 100%; height: 80px; resize: none; border-radius: 4px;padding:4px"><?=htmlspecialchars($uwagi)?></textarea>
            
            <label style="user-select:none;cursor:pointer;display:inline-block" onclick="document.getElementById('regulamin-warn').style.display='none'">
              <input type="checkbox" id="accept-regulamin">
              <div class="checkbox"></div>
              Akceptuję <a href="/regulamin" target="_blank" style="font-weight: bold;color: #4b0;text-decoration: underline;">REGULAMIN</a> <span style="color:red;font-weight: bold;display:none" id="regulamin-warn"> Wymagane*</span>
            </label>

            
            <div class="sameButtons mobileRow">
              <p style="font-size: 15px;">Zostaniesz przeniesiony do strony płatności <img src="/img/p24.png" style="width: 100px;vertical-align: bottom;transform: translateY(4px);"></p>
              <!--<div id="hideOnSuccess">
                <div id="casegpay" style="display:none;margin-bottom: 5px;">Zapłać za pomocą <img src="/img/gpay.png" style="display: inline-block;width: 40px;vertical-align: bottom;margin-left: 2px;">:</div>
                <div id="payment-request-button"></div>
              </div>-->

              <button type="submit" class="btn primary big" style="margin-top: 10px;width: 260px;margin-left:auto">
                <span id="submit_text">ZAMAWIAM I PŁACĘ</span>
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>
          </div>

        </div>

        <div class="sameButtons" style="padding: 10px">
          <button class="btn secondary big pullHigherDesktop" type="button" onclick="showMenu(3)" style="display:inline-block;width:170px">
            <i class="fa fa-chevron-left"></i>
            Cofnij
          </button>
        </div>

      </div>

    </form>
    <?php include "global/footer.php"; ?>
  </body>
</html>
