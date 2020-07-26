<?php //->[zamowienie]

$parts = explode("/", $url);
if (isset($parts[1]) && strlen($parts[1]) > 5)
  $zamowienie_link = $parts[1];
else {
  header("location: /");
  die;
}

$errors = "";

//$zamowienie_data  = fetchRow("SELECT zamowienie_id, user_id, basket, koszt, zlozono, oplacono, wyslano, odebrano, nip, status, imie, nazwisko, email, telefon, firma, paczkomat, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu, dostawa, uwagi, koszt_dostawy, session_id, rabat,  kod_pocztowy_z, miejscowosc_z, kraj, ulica_z, nr_domu_z, nr_lokalu_z,  imie_d, nazwisko_d, firma_d, buyer_type, track, notes, history FROM zamowienia WHERE link = ?",[$zamowienie_link]);
$zamowienie_data = fetchRow("SELECT * FROM zamowienia WHERE link = ?", [$zamowienie_link]);
/*$stmt = $con->prepare("SELECT zamowienie_id, user_id, basket, koszt, zlozono, oplacono, wyslano, odebrano, nip, status, imie, nazwisko, email, telefon, firma, paczkomat, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu, dostawa, uwagi, koszt_dostawy, session_id, rabat,  kod_pocztowy_z, miejscowosc_z, kraj, ulica_z, nr_domu_z, nr_lokalu_z,  imie_d, nazwisko_d, firma_d, buyer_type, track, notes, history FROM zamowienia WHERE link = ?");
$stmt->bind_param("s", $zamowienie_link);
$stmt->execute();
$stmt->bind_result($zamowienie_id, $order_user_id, $basket, $koszt, $zlozono, $oplacono, $wyslano, $odebrano, $nip, $status, $imie, $nazwisko, $email, $telefon, $firma, $paczkomat, $kraj, $miejscowosc, $kod_pocztowy, $ulica, $nr_domu, $nr_lokalu, $dostawa, $uwagi, $koszt_dostawy, $session_id, $rabat_wartosc,  $kod_pocztowy_z, $miejscowosc_z, $kraj, $ulica_z, $nr_domu_z, $nr_lokalu_z,  $imie_d, $nazwisko_d, $firma_d,  $buyer_type, $track, $notes, $history);*/

$basket = $zamowienie_data["basket"];

if (!$zamowienie_data) {
  header("location: /");
  die;
}
//$stmt->close();

// validate payment przelewy24

if (isset($parts[2]) && $parts[2] == 'status') {

  $p24_session_id = $_POST["p24_session_id"];
  $p24_order_id = $_POST["p24_order_id"];
  //[{"url":"zamowienie\/64-63c87b78f711\/status"},{"p24_session_id":"63c87b78f711d61a82a102ae8530d9432419625882e7","p24_amount":"28300","p24_order_id":"304805004","p24_pos_id":"98046","p24_merchant_id":"98046","p24_method":"85","p24_statement":"p24-G80-A50-E04","p24_currency":"PLN","p24_sign":"ca1727002fa0a44f7191920c4136560a"}]

  // use session_id from db, less secure but more reliable
  //$session_id = session_id();

  require_once 'przelewy24/przelewy24.php';

  $P24 = new Przelewy24(secret("p24_merchantId"), secret("p24_posId"), secret("p24_crc"), secret("p24_testMode"));
  $P24->addValue("p24_session_id", $zamowienie_data["session_id"]);
  $P24->addValue("p24_amount", round($zamowienie_data["koszt"] * 100));
  $P24->addValue("p24_currency", $currency);
  $P24->addValue("p24_order_id", $p24_order_id);

  $RET = $P24->trnVerify();

  if (isset($RET["error"]) && $RET["error"] === '0') {
    //echo "poprawna transakcja";
    require "charged_zamowienie.php";
    //header("Location: /zamowienie/$link/oplacono"); // reload the page
  } else {
    //$errors = "<h2 style='color:red; text-align:center;margin-top: 50px;'>Błąd płatności przelewy24</h2>";
  }
  die;
}

// validate payment przelewy24

$dostawaString = isset($dostawy[$zamowienie_data["dostawa"]]) ? $dostawy[$zamowienie_data["dostawa"]] : "";

$res = "<table class='item-list item-list-full'><tr style='background: #60d010;color: white;'>
  <td>Przedmiot</td>
  <td></td>
  <td>Cena</td>
  <td>Ilość</td>
  <td>Suma</td>";

if ($app["user"]["is_admin"]) {
  $res .= "<td>Cena&nbsp;nabycia:</td>";
}

$res .= "</tr>";

$empty = true;
$basket = json_decode($basket, true);
if (empty($basket)) {
  $res = "<h3>Twój koszyk jest pusty!</h3>";
} else {
  function ids($v)
  {
    return $v['v'];
  }

  $ids = trim(json_encode(array_map('ids', $basket)), "[]");

  $products = fetchArray("SELECT product_id, title, link, zdjecie, variant_id FROM variant v INNER JOIN products i USING(product_id) WHERE variant_id IN ($ids)");
  $links = [];
  $zdjecia = [];
  foreach ($products as $product) {
    $variant_id = $product["variant_id"];
    $links[$variant_id] = getProductLink($product["product_id"], $product["link"]);
    $zdjecia[$variant_id] = $product["zdjecie"];
  }

  foreach ($basket as $item) {
    $res .= "<tr>
        <td><img src='/uploads/sm/" . $zdjecia[$item['v']] . "' style='max-width:130px;display:block;margin:auto'></td>
        <td><a class='linkable' href='" . $links[$item['v']] . "'>" . $item['t'] . "</a></td>
        <td class='pln oneline' style='font-weight:normal'><label>Cena:</label> " . $item['f'] . " zł</td>
        <td class='oneline' data-stock=''>" . $item['q'] . " szt.</td>
        <td class='pln oneline basket-price'><label>Suma:</label> <span>" . $item['f'] * $item['q'] . "</span> zł</td>";

    if ($app["user"]["is_admin"]) {
      $res .= "<td class='pln oneline'><label>Cena&nbsp;nabycia:</label> <input class='nabyto' style='width:70px' type='text' onchange='setNabyto(" . $item['v'] . ",this)' value='" . intval(nonull($item, 'nabyto', "")) . "'> zł</td>";
    }
    $res .= "</tr>";
  }
}
$res .= "</table>";

$tracking_link = getTrackingLink($zamowienie_data["track"], $zamowienie_data["dostawa"], "");

?>

<!DOCTYPE html>
<html lang="pl">

<head>
  <title>Zamówienie</title>
  <script src="https://js.stripe.com/v3/"></script>
  <script type="text/javascript" src="https://js.stripe.com/v2/"></script>
  <script async src="https://geowidget.easypack24.net/js/sdk-for-javascript.js"></script>
  <link rel="stylesheet" href="https://geowidget.easypack24.net/css/easypack.css" />
  <meta name="robots" content="noindex">
  <?php include "includes.php"; ?>
  <style>
    .body h4 {
      margin: 20px 0 5px;
      font-size: 16px;
    }

    p {
      margin: 10px 0;
      /*font-size: 15px;*/
    }

    .moje_zamowienia {
      width: 100%;
      margin-top: 30px;
      display: inline-block;
      font-size: 16px;
    }

    .body {
      position: relative;
    }

    .status_btn {
      padding: 4px 7px;
      background: #f5f5f5;
      margin: 2px;
      border: 1px solid #ccc;
      display: inline-block;
      /*width: 100%;*/
      box-sizing: border-box;
    }

    @media only screen and (min-width: 900px) {
      .moje_zamowienia {
        position: absolute;
        width: 185px;
        top: 25px;
      }
    }

    .popup label {
      font-size: 11px;
      margin-top: 2px;
    }

    .popup label input,
    .popup label textarea {
      font-size: 12px;
      padding: 0 2px;
    }

    .popup {
      padding: 20px;
    }
  </style>
  <script>
    <?php if ($zamowienie_data["status"] == 0) : ?>
      status = <?= $zamowienie_data["status"] ?>;

      setInterval(() => {
        ajax('/get_zamowienie_status?link=<?= $zamowienie_link ?>', {}, (response) => {
          if (response != status) {
            window.location.reload();
          }
        }, null);
      }, 3000);
    <?php endif ?>

    <?php if ($app["user"]["is_admin"]) : ?>

      var basket = <?= json_encode($basket) ?>;

      function setNabyto(basket_variant_id, input) {
        input.value = eval(input.value);
        var value = input.value;
        var row = basket.find(e => {
          return e.v == basket_variant_id;
        });
        if (!row) return;

        row.nabyto = value;

        xhr({
          url: "/admin/modify_basket",
          params: {
            zamowienie_id: <?= $zamowienie_data["zamowienie_id"] ?>,
            basket: JSON.stringify(basket)
          },
          success(res) {
            showNotification(`<i class="fas fa-check"></i> Zapisano koszt nabycia</b>`);
            updateZysk();
          }
        });
      }

      function updateZysk() {
        var zysk = 0;
        $$(".basket-price span").forEach(e => {
          zysk += parseInt(e.innerHTML);
        })
        $$(".nabyto").forEach(e => {
          zysk -= parseInt(e.value);
        })
        $("#zysk").innerHTML = zysk + " zł";
      }

      document.addEventListener("DOMContentLoaded", function() {
        updateZysk();
        createTable({
          name: "historytable",
          url: "/admin/search_activity_log",
          lang: {
            subject: "wyników",
          },
          width: 1100,
          params: () => {
            return {
              scope: "order",
              scope_item_id: <?= $zamowienie_data["zamowienie_id"] ?>,
            }
          },
          definition: [{
              title: "Kto",
              width: "10%",
              render: (r) => {
                return nonull(r.user);
              }
            },
            {
              title: "Zmiana",
              width: "30%",
              className: "auto-width",
              render: (r) => {
                return r.log;
              }
            },
            {
              title: "Kiedy",
              width: "10%",
              render: (r) => {
                return r.logged_at;
              }
            },
          ],
          controlsRight: `
                <div class='float-icon'>
                  <input type="text" placeholder="Szukaj..." data-param="search">
                  <i class="fas fa-search"></i>
                </div>
              `
        });
      });
    <?php endif; ?>
  </script>
</head>

<body class="default-form">
  <?php include "global/header.php"; ?>
  <div class="body" style="width:100%;max-width: 1100px; margin: auto;padding: 10px 10px 60px; box-sizing: border-box;">
    <?php if ($app["user"]["is_admin"]) { ?>
      <div class="navbar_wrapper">
        <div class="navbar_admin">
          <?php include "admin/navbar.php" ?>
        </div>
      </div>
    <?php } else if ($app["user"]["id"]) { ?>
      <a href="/moje-konto/zamowienia" class="btn secondary moje_zamowienia">
        <i class="fa fa-chevron-left"></i>
        Moje zamówienia
      </a>
    <?php } ?>

    <?= $errors ?>

    <h3 style="text-align: center;font-size: 20px;margin: 45px 0 35px;">
      <?php
      if ($zamowienie_data["status"] == 0) {
        echo "Opłata za zamówienie";
      } else {
        echo "Zamówienie";
      }
      echo " #" . $zamowienie_data["zamowienie_id"];

      if ($app["user"]["is_admin"]) { // status is an actual ID
        echo "<button class='btn primary' style='font-size:14px;margin-left:5px;font-weight:normal' onclick='showModal(\"zamowienieForm\");'>Edytuj</button>";
        echo "<a class='btn primary' style='font-size:14px;margin-left:5px;font-weight:normal' href='/zakup/$zamowienie_link'>Ponów</a>";
      }
      ?>
    </h3>

    <h4 style="margin-bottom: 24px;text-align: center;font-size:17px">Status: <?php
                                                                              //include "status_div.php";
                                                                              echo renderStatus($zamowienie_data["status"]);
                                                                              ?></h4>

    <div style="text-align:center">
      <?php
      if ($app["user"]["is_admin"]) { // status is an actual ID
        $c = 0;
        foreach ($statusList as $status_id => $status) {
          $status_text = $status["title"];
          if ($status_id == 2 && $zamowienie_data["dostawa"] == 'o') continue;
          if ($status_id == 5 && $zamowienie_data["dostawa"] != 'o') continue;
          $c++;

          //$current = $k == $status ? "style='background:#60d010;color:white' onclick='return false;'" : "";
          $current = $zamowienie_data["status"] == $status_id ? "style='background:#" . $status["color"] . ";color:white' " : "";
          if ($status_id == 2 && !$tracking_link)
            $current .=  " onclick='return confirm(\"Nie podałeś nr śledzenia paczki, kontynuować pomimo tego?\");' ";

          echo "<a class='status_btn' $current href='/admin/zmien_status/" . $zamowienie_link . "/$status_id'>$c. $status_text</a>";
        }

        if (!empty($zamowienie_data["user_id"])) {
          $user = fetchRow("SELECT imie, nazwisko, firma, email,
                  (select count(1) from zamowienia z where z.user_id = u.user_id) as count
                  FROM users u WHERE user_id = " . intval($zamowienie_data["user_id"]));

          if ($user) {
            echo "<div style='margin-top:25px'><a href='/moje-konto/dane-uzytkownika/" . $zamowienie_data["user_id"] . "'><i class='fa fa-user'></i> "
              . $user["imie"]
              . " "
              . $user["nazwisko"]
              . " "
              . $user["firma"]
              . " "
              . $user["email"]
              . "</a> <a tyle='button' class='btn primary' href='/admin/uzytkownicy/" . $zamowienie_data["user_id"] . "'>Zamówienia (" . $user["count"] . ")</a></div>";
          }
        }
      }
      ?>
    </div>

    <div class="mobileRow">

      <div style="width:100%;max-width: 300px; margin: 0 auto;padding: 10px;" class="noMaxWidthMobile">
        <h4>Dane kontaktowe</h4>

        <p><?php
            $daneKontaktowe = "";
            if ($zamowienie_data["nip"] || $zamowienie_data["firma"]) {
              $daneKontaktowe = $zamowienie_data["firma"] . "<br>NIP:&nbsp;" . $zamowienie_data["nip"];
            } else {
              $daneKontaktowe = $zamowienie_data["imie"] . " " . $zamowienie_data["nazwisko"];
            }

            echo $daneKontaktowe
              . "<br>"
              . $zamowienie_data["ulica"]
              . " "
              . $zamowienie_data["nr_domu"]
              . " "
              . ($zamowienie_data["nr_lokalu"] ? "/" : "")
              . $zamowienie_data["nr_lokalu"]
              . "<br>"
              . $zamowienie_data["kod_pocztowy"]
              . " "
              . $zamowienie_data["miejscowosc"]
              . ", "
              . $zamowienie_data["kraj"];
            //echo "<br>"."$kod_pocztowy_z $miejscowosc_z, $kraj")."<br>"."$ulica_z $nr_domu_z".($nr_lokalu_z ? "/" : "")."$nr_lokalu_z");
            echo '<span style="height: 7px;display:block"></span>';
            echo $zamowienie_data["telefon"] . "<br>" . $zamowienie_data["email"];
            ?></p>

        <h4>Rodzaj dostawy</h4>

        <p><?= $dostawaString ?></p>

        <?php if ($app["user"]["is_admin"]) : ?>
          <div>
            <span>Nr śledzenia paczki</span>
            <button type="button" class="btn primary" onclick='showModal("zamowienieForm");document.getElementsByName("e_track")[0].focus()'>Edytuj <i class="fa fa-cog" style="margin-left: 3px;"></i></button>
            <br>
            <a style="font-weight:bold" target="_blank" class="link" href="<?= $tracking_link ?>"><?= $tracking_link ?></a>
          </div>
        <?php elseif ($tracking_link) : ?>
          <a style="font-weight:bold" target="_blank" class="link" href="<?= $tracking_link ?>">Śledź przesyłkę</a>
        <?php endif ?>

        <h4>Adres dostawy</h4>

        <p><?php
            /*if ($dostawa != "k") {
                if ($dostawa == "p") {
                  echo "Paczkomat $paczkomat")."<br>";
                }
                //else echo $daneKontaktowe;
              }*/
            if ($zamowienie_data["dostawa"] == "p") {
              echo "Paczkomat " . $zamowienie_data["paczkomat"] . "<br>";
            } else {
              echo $zamowienie_data["imie_dostawa"]
                . " "
                . $zamowienie_data["nazwisko_dostawa"]
                . ($zamowienie_data["firma_dostawa"] == '' ? '' : "<br>" . $zamowienie_data["firma_dostawa"]);
              echo '<span style="height: 7px;display:block"></span>';
            }
            //if ($dostawa != "o")
            echo $zamowienie_data["ulica_dostawa"]
              . " "
              . $zamowienie_data["nr_domu_dostawa"]
              . ($zamowienie_data["nr_lokalu_dostawa"] ? "/" : "")
              . $zamowienie_data["nr_lokalu_dostawa"]
              . "<br>"
              . $zamowienie_data["kod_pocztowy_dostawa"]
              . " "
              . $zamowienie_data["miejscowosc_dostawa"]
              . ", " .
              $zamowienie_data["kraj_dostawa"];
            //else
            //echo $kraj)."<br>"."$miejscowosc, $ulica");
            ?></p>

        <h4>Forma zapłaty</h4>

        <p>
          <img style="width: 100px;vertical-align: middle;" src="/img/p24.png">
        </p>

      </div>

      <div style="width: 100%;margin: 0 auto;padding: 10px;">
        <h4>Produkty</h4>

        <div class="zamowienie adjustable-list"><?= $res ?></div>

        <div style="margin-top: 13px;text-align: right;padding: 5px;" class="mobileTextCenter">
          <span style="display:block;font-size: 14px;">Koszt dostawy <span class="pln" id="koszt_dostawy_label"><?= $zamowienie_data["koszt_dostawy"] ?> zł</span></span>
          <?php if ($zamowienie_data["rabat_wartosc"] > 0) : ?>
            <span style="font-size: 14px;display:block;color: #4b0;font-weight: bold;" id="kod_rabatowy_wrapper">KOD RABATOWY <span class="pln" id="kod_rabatowy_label"><?= -intval($zamowienie_data["rabat_wartosc"]) ?> <?= $zamowienie_data["rabat_type"] == "static" ? "zł" : "%" ?></span></span>
          <?php endif ?>
          <span style="display:inline-block;font-size: 16px;padding: 0 3px;">Całkowity koszt zamówienia</span>
          <b style="display:inline-block;font-size: 18px;"><span id="total-cost" style="display:inline-block;" class="pln"><?= $zamowienie_data["koszt"] ?> zł</span></b>

          <?php if ($app["user"]["is_admin"]) : ?>
            <br>
            <span style="display:inline-block;font-size: 16px;padding: 0 3px;">Zysk</span>
            <b style="display:inline-block;font-size: 18px;"><span id="zysk" style="display:inline-block;" class="pln"> zł</span></b>
          <?php endif ?>
        </div>

        <h4>Uwagi dotyczące zamówienia</h4>
        <textarea name="uwagi" readonly style="width: 100%; height: 80px; resize: none;"><?= $zamowienie_data["uwagi"] ?></textarea>

        <?php if ($app["user"]["is_admin"]) : ?>
          <h4>Notatki (niewidoczne dla klienta)</h4>
          <textarea onclick='showModal("notatkaForm",{source:this});moveCursorToEnd(document.getElementsByName("e_notes")[0])' name="notes" readonly style="width: 100%;cursor:pointer; height: 80px; resize: none;"><?= $zamowienie_data["notes"] ?></textarea>

          <h3>Pełna historia zamówienia:</h3>
          <div class="historytable"></div>
        <?php else : ?>
          <h4>Data złożenia zamówienia</h4>
          <p><?= dateDifference($zamowienie_data["zlozono"]) ?></p>

          <?php if (!empty($zamowienie_data["oplacono"])) : ?>
            <h4>Opłacono</h4>
            <p><?= dateDifference($zamowienie_data["oplacono"]) ?></p>
          <?php endif ?>

          <?php if (!empty($zamowienie_data["wyslano"])) : ?>
            <h4>Wysłano</h4>
            <p><?= dateDifference($zamowienie_data["wyslano"]) ?></p>
          <?php endif ?>

          <?php if (!empty($zamowienie_data["odebrano"])) : ?>
            <h4>Odebrano</h4>
            <p><?= dateDifference($zamowienie_data["odebrano"]) ?></p>
          <?php endif ?>
        <?php endif ?>

        <div style="margin: 30px 0 70px">
          <?php if ($zamowienie_data["status"] == 0) : ?>
            <div class="mobileRow">
              <b style="display:block;font-size: 20px; text-align: center; margin: 15px 0 35px;min-width:300px">Zapłać <?= $zamowienie_data["koszt"] ?> zł</b>

              <a href="/przelewy24_repeat_payment?link=<?= $zamowienie_link ?>" style="border: 1px solid #ddd;background: #fafafa;display: flex;width: 100%;justify-content: center;cursor: pointer;align-items: center;height: 50px;">
                Zapłać teraz <img style="width: 100px;margin-left:10px" src="/img/p24.png">
              </a>

              <div id="hideOnSuccess" style="display:none">
                <!--<div id="casegpay" style="display:none;margin-bottom: 5px;">Zapłać za pomocą <img src="/img/gpay.png" style="display: inline-block;width: 40px;vertical-align: bottom;margin-left: 2px;">:</div>-->
                <div style="position:relative">
                  <div id="casegpay" style="width: calc(100% + 2px);height: 40px;background: black;position: absolute;z-index: 10000;pointer-events: none;left: -1px;border-radius: 4px;display: none;justify-content: center;align-items: center;">
                    <img src="/img/gpay.png" style="display: inline-block;width: 60px;vertical-align: bottom;margin-top: 3px;">
                  </div>
                  <div id="payment-request-button"></div>
                </div>
              </div>
            </div>
          <?php endif ?>
        </div>

      </div>

    </div>
  </div>

  <?php if ($app["user"]["is_admin"]) : ?>
    <div id="zamowienieForm" data-modal>
      <form action="/admin/edit_zamowienie" method="post" class="mobileRow default-form modal-padding">
        <div style="margin-right:5px;width:50%">
          <p>Dane kontaktowe</p>
          <label>
            <span>Imię</span>
            <input type="text" name="e_imie" value="<?= $zamowienie_data["imie"] ?>">
          </label>
          <label>
            <span>Nazwisko</span>
            <input type="text" name="e_nazwisko" value="<?= $zamowienie_data["nazwisko"] ?>">
          </label>

          <label>
            <span>Nazwa firmy</span>
            <input type="text" name="e_firma" value="<?= $zamowienie_data["firma"] ?>">
          </label>
          <label>
            <span>NIP</span>
            <input type="text" name="e_nip" value="<?= $zamowienie_data["nip"] ?>">
          </label>

          <label>
            <span>Adres e-mail</span>
            <input type="text" name="e_email" value="<?= $zamowienie_data["email"] ?>">
          </label>
          <label>
            <span>Nr telefonu</span>
            <input type="text" name="e_telefon" value="<?= $zamowienie_data["telefon"] ?>">
          </label>

          <label>
            <span>Kraj</span>
            <input type="text" name="e_kraj" value="<?= $zamowienie_data["kraj"] ?>">
          </label>
          <label>
            <span>Kod pocztowy</span>
            <input type="text" name="e_kod_pocztowy" value="<?= $zamowienie_data["kod_pocztowy"] ?>">
          </label>
          <label>
            <span>Miejscowość</span>
            <input id="miejscowosc_z" type="text" name="e_miejscowosc" placeholder=" " value="<?= $zamowienie_data["miejscowosc"] ?>">
          </label>
          <label>
            <span>Ulica</span>
            <input type="text" name="e_ulica" value="<?= $zamowienie_data["ulica"] ?>">
          </label>
          <div style="display:flex">
            <label style="flex-grow:1;margin-right:10px">
              <span>Nr domu</span>
              <input type="text" name="e_nr_domu" value="<?= $zamowienie_data["nr_domu"] ?>">
            </label>
            <label style="flex-grow:1;">
              <span>Nr lokalu</span>
              <input type="text" name="e_nr_lokalu" value="<?= $zamowienie_data["nr_lokalu"] ?>">
            </label>
          </div>

          <label>
            <span>Notatki</span>
            <textarea name="e_notes" style="width: 100%; height: 80px; resize: none; border-radius: 4px;box-sizing: border-box;padding:4px"><?= $zamowienie_data["notes"] ?></textarea>
          </label>
        </div>
        <div style="margin-left:5px;width:50%">
          <p>Adres dostawy</p>
          <label>
            <span>Imię</span>
            <input type="text" name="e_imie_dostawa" value="<?= $zamowienie_data["imie_dostawa"] ?>">
          </label>
          <label>
            <span>Nazwisko</span>
            <input type="text" name="e_nazwisko_dostawa" value="<?= $zamowienie_data["nazwisko_dostawa"] ?>">
          </label>

          <label>
            <span>Nazwa firmy <i style="font-size: 0.8em;color: #666;font-style: normal;">(opcjonalnie)</i></span>
            <input type="text" name="e_firma_dostawa" value="<?= $zamowienie_data["firma_dostawa"] ?>">
          </label>

          <label>
            <span>Nr Paczkomatu</span>
            <input type="text" name="e_paczkomat" value="<?= $zamowienie_data["paczkomat"] ?>">
          </label>
          <label>
            <span>Kraj</span>
            <input type="text" name="e_kraj_dostawa" value="<?= $zamowienie_data["kraj_dostawa"] ?>">
          </label>
          <label>
            <span>Kod pocztowy</span>
            <input type="text" name="e_kod_pocztowy_dostawa" value="<?= $zamowienie_data["kod_pocztowy_dostawa"] ?>">
          </label>
          <label>
            <span>Miejscowość</span>
            <input id="miejscowosc" type="text" name="e_miejscowosc_dostawa" value="<?= $zamowienie_data["miejscowosc_dostawa"] ?>">
          </label>
          <label>
            <span>Ulica</span>
            <input type="text" value="<?= $zamowienie_data["ulica_dostawa"] ?>" name="e_ulica_dostawa">
          </label>
          <div style="display:flex">
            <label style="flex-grow:1;margin-right:10px">
              <span>Nr domu</span>
              <input type="text" value="<?= $zamowienie_data["nr_domu_dostawa"] ?>" name="e_nr_domu_dostawa">
            </label>
            <label style="flex-grow:1;">
              <span>Nr lokalu</span>
              <input type="text" value="<?= $zamowienie_data["nr_lokalu_dostawa"] ?>" name="e_nr_lokalu_dostawa">
            </label>
          </div>
          <label>
            <span>Uwagi</span>
            <textarea name="e_uwagi" style="width: 100%; height: 80px; resize: none; border-radius: 4px;box-sizing: border-box;padding:4px"><?= $zamowienie_data["uwagi"] ?></textarea>
          </label>

          <label>
            <span>Nr śledzenia paczki</span>
            <input type="text" name="e_track" value="<?= $zamowienie_data["track"] ?>">
          </label>

          <input type="hidden" value="<?= $zamowienie_link ?>" name="link">
          <div style="text-align:right;padding-top:20px">
            <div class="btn secondary" onclick="hideParentModal(this)">Anuluj</div>
            <input type="submit" class="btn primary" value="Zapisz">
          </div>
        </div>
      </form>
    </div>
    <div id="notatkaForm" data-modal>
      <form action="/admin/edit_zamowienie" method="post" class="default-form modal-padding" style="width:100%;max-width:500px">
        <label>
          <span>Notatki</span>
          <textarea name="e_notes" style="width: 100%; height: 80px; resize: none; border-radius: 4px;box-sizing: border-box;padding:4px"><?= $zamowienie_data["notes"] ?></textarea>
        </label>

        <input type="hidden" value="<?= $zamowienie_link ?>" name="link">
        <div style="text-align:right;padding-top:20px">
          <div class="btn secondary" onclick="hideParentModal(this)">Anuluj</div>
          <input type="submit" class="btn primary" value="Zapisz">
        </div>
      </form>
    </div>
  <?php endif ?>

  <?php include "global/footer.php"; ?>
</body>

</html>