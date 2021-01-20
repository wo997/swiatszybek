<?php //route[potwierdz_zamowienie]

$impersonate = false;
if (isset($_POST["impersonate"]) && $_POST["impersonate"] == 1) {
    $impersonate = true;
    $user_id = isset($_SESSION["user_id_impersonate"]) ? $_SESSION["user_id_impersonate"] : NULL;
    $user_type = $_SESSION["user_type_impersonate"];
} else {
    $user_id = $app["user"]["id"];
    $user_type = $app["user"]["type"];
}
$user_id = intval($user_id);


include "helpers/safe_post.php";

if ($_POST["buyer_type"] == 'f') {
    $_POST["imie"] = "";
    $_POST["nazwisko"] = "";
} else {
    $_POST["firma"] = "";
    $_POST["nip"] = "";
}

if ($_POST["email"] == '') {
    redirect("/zakup");
}

// lower kod rabatowy count
$kod_rabatowy = isset($_SESSION["kod"]) ? $_SESSION["kod"] : false;
$kod_rabatowy_wartosc = isset($_SESSION["rabat"]) ? floatval($_SESSION["rabat"]) : 0;
$kod_rabatowy_type = isset($_SESSION["rabat_type"]) ? $_SESSION["rabat_type"] : "static";

if ($kod_rabatowy) {
    $stmt = $con->prepare("UPDATE kody_rabatowe SET ilosc = ilosc - 1 WHERE kod = ? AND ilosc > 0");
    $stmt->bind_param("s", $kod_rabatowy);
    $stmt->execute();
    $stmt->close();
}

unset($_SESSION["kod"]);
unset($_SESSION["rabat"]);
unset($_SESSION["rabat_type"]);

$link_hash = bin2hex(random_bytes(6));

$koszt_dostawy = 0;
if ($_POST["dostawa"] == 'o') {
    $oddzial_id = intval($oddzial_id);
} else {
    $oddzial_id = NULL;
}

if ($_POST["dostawa"] == 'k') {
    $koszt_dostawy = config('kurier_cena', 0);
}
if ($_POST["dostawa"] == 'p') {
    $koszt_dostawy = config('paczkomat_cena', 0);
}

if ($kod_rabatowy_type == "static") {
    $koszt = $app["user"]["basket"]["total_basket_cost"] - $kod_rabatowy_wartosc;
} else {
    $koszt = roundPrice($app["user"]["basket"]["total_basket_cost"] * (1 - 0.01 * $kod_rabatowy_wartosc));
}
$koszt += $koszt_dostawy;

$koszt = roundPrice($koszt);

$session_id = $link_hash . session_id();

$paczkomat = $_POST["dostawa"] == 'p' ? def($_POST, "paczkomat", NULL) : NULL;

DB::execute(
    "INSERT INTO zamowienia (
    user_id, link, koszt, zlozono, status_id,
    imie, nazwisko, email, telefon, firma, nip,
    dostawa, paczkomat, oddzial_id,
    kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu,
    kraj_dostawa, miejscowosc_dostawa, kod_pocztowy_dostawa, ulica_dostawa, nr_domu_dostawa, nr_lokalu_dostawa,
    uwagi, koszt_dostawy, buyer_type, session_id, forma_zaplaty, 
    rabat_wartosc, rabat_type, rabat_kod
  )

  VALUES (
    ?,CONCAT((SELECT * FROM (SELECT IF(ISNULL(MAX(zamowienie_id)),1,MAX(zamowienie_id)+1) FROM zamowienia) as x),'-',?),?,?,?,?,
    ?,?,?,?,?,
    ?,?,?,
    ?,?,?,?,?,?,
    ?,?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?
  )",
    [
        $user_id, $link_hash, $koszt, date("Y-m-d H:i:s"), 0,
        $_POST["imie"], $_POST["nazwisko"], $_POST["email"], $_POST["telefon"], $_POST["firma"], $_POST["nip"],
        $_POST["dostawa"], $paczkomat, $oddzial_id,
        $_POST["kraj"], $_POST["miejscowosc"], $_POST["kod_pocztowy"], $_POST["ulica"], $_POST["nr_domu"], $_POST["nr_lokalu"],
        $_POST["kraj_dostawa"], $_POST["miejscowosc_dostawa"], $_POST["kod_pocztowy_dostawa"], $_POST["ulica_dostawa"], $_POST["nr_domu_dostawa"], $_POST["nr_lokalu_dostawa"],
        $_POST["uwagi"], $koszt_dostawy, $_POST["buyer_type"], $session_id, $_POST["forma_zaplaty"],
        $kod_rabatowy_wartosc, $kod_rabatowy_type, $kod_rabatowy
    ]
);

$zamowienie_id = DB::lastInsertedId();

// cannot use order/print_basket_nice because in email no css stylesheets are allowed, would we want to merge it?
$res = "<table style='border-spacing: 0;'><tr style='background: " . primary_clr . ";color: white;'><td style='padding:4px'>Ilość</td><td style='padding:4px'>Produkt</td><td style='padding:4px'>Cena</td></tr>";

foreach ($app["user"]["basket"]["variants"] as $v) {
    DB::execute("INSERT INTO basket_content (zamowienie_id, variant_id, product_id, real_price, quantity, total_price, title, zdjecie) VALUES (?,?,?,?,?,?,?,?)", [
        $zamowienie_id, $v["variant_id"], $v["product_id"], $v["real_price"], $v["quantity"], $v["total_price"], $v["title"] . " " . $v["name"], $v["zdjecie"]
    ]);

    DB::execute("UPDATE products SET cache_sales = cache_sales + ? WHERE product_id = ?", [$v["quantity"], $v["variant_id"]]);

    DB::execute("UPDATE variant SET stock = stock - " . intval($v["quantity"]) . " where variant_id = " . intval($v["quantity"]));

    $res .= "<tr><td style='padding:4px'>" . $v["quantity"] . " szt.</td><td style='padding:4px'>" . $v["title"] . " " . $v["name"] . "</td><td style='padding:4px'>" . $v["total_price"] . " zł</td></tr>";
}
$res .= "</table>";

triggerEvent("order_basket_change", ["zamowienie_id" => $zamowienie_id]);

$link = $zamowienie_id . "-" . $link_hash;

setBasketData([]);

addZamowienieLog($zamowienie_id, "Utworzono zamówienie");

$link_relative = getZamowienieLink($link, true);
$link_full = getZamowienieLink($link);

// update user data
// cmon it sucks bad, u better store all data and not remove the previous set

/*
if (!$impersonate) {
  if ($_POST["dostawa"] == 'k' && $_POST["miejscowosc"] != "") {
    DB::execute("UPDATE users SET kraj = ?, miejscowosc = ?, kod_pocztowy = ?, ulica = ?, nr_domu = ? WHERE user_id = $user_id LIMIT 1", [
      $_POST["kraj"], $_POST["miejscowosc"], $_POST["kod_pocztowy"], $_POST["ulica"], $_POST["nr_domu"]
    ]);
  }

  if ($user_type != 'regular') {
    DB::execute("UPDATE users SET email = ? WHERE user_id = $user_id LIMIT 1", [
      $_POST["email"], $user_id
    ]);
  }

  if ($_POST["buyer_type"] == 'f') {
    DB::execute("UPDATE users SET firma = ?, nip = ?, email = ?, telefon = ? WHERE user_id = ? LIMIT 1", [
      $_POST["firma"], $_POST["nip"], $_POST["email"], $_POST["telefon"], $user_id
    ]);
  } else {
    DB::execute("UPDATE users SET imie = ?, nazwisko = ?, email = ?, telefon = ? WHERE user_id = ? LIMIT 1", [
      $_POST["imie"], $_POST["nazwisko"], $_POST["email"], $_POST["telefon"], $user_id
    ]);
  }
}
*/

// send mail
$adresWho = $_POST["imie_dostawa"] . " " . $_POST["nazwisko_dostawa"];
if ($_POST["firma_dostawa"] != '') {
    $adresWho .= $_POST["firma_dostawa"];
}

$kontaktAdresString =  $_POST["kod_pocztowy"] . " " . $_POST["miejscowosc"] . ", " . $_POST["kraj"] . "<br>" . $_POST["ulica"] . ", " . $_POST["nr_domu"] . ($_POST["nr_lokalu"] ? "/" : "") . $_POST["nr_lokalu"];

$dostawaAdresString =  $_POST["kod_pocztowy_dostawa"] . " " . $_POST["miejscowosc_dostawa"] . ", " . $_POST["kraj_dostawa"] . "<br>" . $_POST["ulica_dostawa"] . ", " . $_POST["nr_domu_dostawa"] . ($_POST["nr_lokalu_dostawa"] ? "/" : "") . $_POST["nr_lokalu_dostawa"];

$dostawy = ["p" => "Paczkomat", "k" => "Kurier", "o" => "Odbiór osobisty"];
$dostawaString = isset($dostawy[$_POST["dostawa"]]) ? $dostawy[$_POST["dostawa"]] : "";

$message = "<h2>Potwierdzenie zamówienia #$zamowienie_id</h2>";

$message .= "<div style='font-size: 14px;'>";
$message .= "<table>";
if ($_POST["buyer_type"] == 'f') {
    $message .= "<tr><td>Firma: </td><td>" . $_POST["firma"] . "</td></tr>";
    $message .= "<tr><td>NIP: </td><td>" . $_POST["nip"] . "</td></tr>";
} else {
    $message .= "<tr><td>Imię i nazwisko: </td><td>" . $_POST["imie"] . " " . $_POST["nazwisko"] . "</td></tr>";
}
$message .= "<tr><td>Nr telefonu: </td><td>" . $_POST["telefon"] . "</td></tr>";
$message .= "<tr><td style='vertical-align: top;'>Adres zamawiającego: </td><td>$kontaktAdresString</td></tr>";
$message .= "<tr><td>Data utworzenia: </td><td>" . niceDate() . "</td></tr>";
$message .= "<tr><td style='vertical-align: top;'>Rodzaj dostawy: </td><td>$dostawaString ($koszt_dostawy zł)</td></tr>";
$message .= "<tr><td style='vertical-align: top;'>Adres dostawy: </td><td>$adresWho<div style='height: 7px;'></div>$dostawaAdresString</td></tr>";
$message .= "<tr><td>Koszt produktów: </td><td>" . $app["user"]["basket"]["total_basket_cost"] . " zł</td></tr>";
$message .= "<tr><td><b>Całkowity koszt zamówienia: </b></td><td><b>$koszt zł</b></td></tr>";
$message .= "</table>";

if ($_POST["uwagi"] != "") $message .= "<p><span style='text-decoration: underline;'>Uwagi dotyczące zamówienia:</span><br>" . nl2br($_POST["uwagi"]) . "</p>";

$message .= "<h4 style='margin:20px 0 10px'>Szczegóły zamówienia</h4>";
$message .= $res;
$message .= "</div>";

$message .= '<p style="font-size: 16px;">Jeśli jeszcze nie opłaciłaś/eś Twojego zamówienia,<br>możesz to zrobić teraz korzystając <a href="' . $link_full . '" style="font-weight:bold;color:' . primary_clr . ';">z tego linku</a></p>';
$message .= getEmailFooter();

$mailTitle = "Potwierdzenie zamówienia #$zamowienie_id - " . $app["company_data"]['email_sender'] . "";

@sendEmail($_POST["email"], $message, $mailTitle);

foreach (getOrderEmailList() as $email) {
    @sendEmail($email, $message, $mailTitle);
}

/*if ($_POST["forma_zaplaty"] == '24') {
  require 'user/przelewy24/przelewy24_register_payment.php';
} else {
  header("Location: $link");
  die;
}*/
redirect($link_relative);
