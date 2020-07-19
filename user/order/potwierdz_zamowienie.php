<?php //->[potwierdz_zamowienie]

$impersonate = false;
if (isset($_POST["impersonate"]) && $_POST["impersonate"] == 1)
{
  $impersonate = true;
  $user_id = isset($_SESSION["user_id_impersonate"]) ? $_SESSION["user_id_impersonate"] : NULL;
  $user_type = $_SESSION["user_type_impersonate"];
}
else {
  $user_id = $app["user"]["id"];
  $user_type = $app["user"]["type"];
}

//$posts = ["imie","nazwisko","email","telefon","firma","paczkomat_i","kraj_i", "miejscowosc_i", "kod_pocztowy_i", "ulica_i", "nr_domu_i","dostawa","uwagi","oddzial_id","buyer_type","nr_lokalu_i","nip","kraj_z","kod_pocztowy_z","miejscowosc_z","ulica_z","nr_domu_z","nr_lokalu_z","imie_d","nazwisko_d","firma_d","forma_zaplaty"];

include "helpers/safe_post.php";

if ($_POST["buyer_type"] == 'f')
{
  $_POST["imie"] = "";
  $_POST["nazwisko"] = "";
}
else
{
  $_POST["firma"] = "";
  $_POST["nip"] = "";
}

if ($_POST["email"] == '') {
  header("Location: /zakup");
  die;
}

require_once "get_basket_data.php";

require "helpers/validate_stock.php";

// lower kod rabatowy count
$kod_rabatowy = isset($_SESSION["kod"]) ? $_SESSION["kod"] : false;
$kod_rabatowy_wartosc = isset($_SESSION["rabat"]) ? floatval($_SESSION["rabat"]) : 0;
$kod_rabatowy_type = isset($_SESSION["rabat_type"]) ? $_SESSION["rabat_type"] : "static";

if ($kod_rabatowy)
{
  $stmt = $con->prepare("UPDATE kody_rabatowe SET ilosc = ilosc - 1 WHERE kod = ? AND ilosc > 0");
  $stmt->bind_param("s", $kod_rabatowy);
  $stmt->execute();
  $stmt->close();
}

unset($_SESSION["kod"]);
unset($_SESSION["rabat"]);
unset($_SESSION["rabat_type"]);

require_once "print_basket_nice.php";

$res = "<table style='border-spacing: 0;'><tr style='background: #60d010;color: white;'><td style='padding:4px'>Ilość</td><td style='padding:4px'>Produkt</td><td style='padding:4px'>Cena</td></tr>";
$basket_all_data = [];

foreach($app["user"]["basket"]["variants"] as $basket_variant) {
  $v = $basket_variant;
  $product_id = $v["product_id"];
  $title = $v["title"];
  $name = $v["name"];
  $price = $v["real_price"];
  $total_price = $v["total_price"];
  $quantity = $v["quantity"];
  $stock = $v["stock"];

  if (!empty($name))
    $title .= " ".$name;

  $basket_all_data[] = ['v'=>$variant_id,'q'=>$quantity,'p'=>$price,'f'=>$total_price,'t'=>$title,'i'=>$product_id];

  query("UPDATE products SET cache_sales = cache_sales + ? WHERE product_id = ?",[$quantity, $product_id]);
  
  query("UPDATE variant SET stock = stock - " . intval($quantity) . " where variant_id = " . intval($variant_id));

  // display in email

  $res .= "<tr><td style='padding:4px'>$quantity szt.</td><td style='padding:4px'>$title</td><td style='padding:4px'>$total_price zł</td></tr>";
}
$res .= "</table>";


$basket = json_encode($basket_all_data);

$link_hash = bin2hex(random_bytes(6));

$koszt_dostawy = 0;
if ($_POST["dostawa"] == 'o')
{
  $oddzial_id = intval($oddzial_id);
} else {
  $oddzial_id = NULL;
}

if ($_POST["dostawa"] == 'k') {
  $koszt_dostawy = config('kurier_cena',0);
}
if ($_POST["dostawa"] == 'p') {
  $koszt_dostawy = config('paczkomat_cena',0);
}

if ($kod_rabatowy_type == "static") {
  $koszt = $app["user"]["basket"]["total_basket_cost"] - $kod_rabatowy_wartosc;
} else {
  $koszt = round($app["user"]["basket"]["total_basket_cost"]*(1-0.01*$kod_rabatowy_wartosc));
}
$koszt += $koszt_dostawy;

$session_id = $link_hash.session_id();

$paczkomat = $_POST["dostawa"] == 'p' ? nonull($_POST,"paczkomat",NULL) : NULL;

query("INSERT INTO zamowienia (
    user_id, link, basket, koszt, zlozono, status,
    imie, nazwisko, email, telefon, firma, nip,
    dostawa, paczkomat, oddzial_id,
    kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu,
    kraj_dostawa, miejscowosc_dostawa, kod_pocztowy_dostawa, ulica_dostawa, nr_domu_dostawa, nr_lokalu_dostawa,
    uwagi, koszt_dostawy, buyer_type, session_id, forma_zaplaty, 
    rabat_wartosc, rabat_type, rabat_kod
  )

  VALUES (
    ?,CONCAT((SELECT * FROM (SELECT IF(ISNULL(MAX(zamowienie_id)),1,MAX(zamowienie_id)+1) FROM zamowienia) as x),'-',?),?,?,?,?,
    ?,?,?,?,?,?,
    ?,?,?,
    ?,?,?,?,?,?,
    ?,?,?,?,?,?,
    ?,?,?,?,?,
    ?,?,?
  )",
  [
    $user_id, $link_hash, $basket, $koszt, date("Y-m-d H:i:s"), 0,
    $_POST["imie"], $_POST["nazwisko"], $_POST["email"], $_POST["telefon"], $_POST["firma"], $_POST["nip"],
    $_POST["dostawa"], $paczkomat, $oddzial_id,
    $_POST["kraj"], $_POST["miejscowosc"], $_POST["kod_pocztowy"], $_POST["ulica"], $_POST["nr_domu"], $_POST["nr_lokalu"],
    $_POST["kraj_dostawa"], $_POST["miejscowosc_dostawa"], $_POST["kod_pocztowy_dostawa"], $_POST["ulica_dostawa"], $_POST["nr_domu_dostawa"], $_POST["nr_lokalu_dostawa"],
    $_POST["uwagi"], $koszt_dostawy, $_POST["buyer_type"], $session_id, $_POST["forma_zaplaty"],
    $kod_rabatowy_wartosc, $kod_rabatowy_type, $kod_rabatowy
  ]
);

$zamowienie_id = getLastInsertedId();

/*foreach ($basket_ids as $variant_id) {
  query("INSERT INTO basket_content (basket_item_id	zamowienie_id	variant_id	product_id	base_price	quantity	price	title)")
}*/


$link = $zamowienie_id . "-" . $link_hash;

$_SESSION["basket"] = "";
setcookie("basket", "", (time() + 31536000) , '/');

addLogForZamowienie($zamowienie_id,"Utworzono zamówienie");
addZamowienieLog("Utworzono zamówienie",$zamowienie_id);

$link = getZamowienieLink($link);

// update user data

if (!$impersonate) {
  if ($_POST["dostawa"] == 'k' && $_POST["miejscowosc_i"] != "") {
    query("UPDATE users SET kraj = ?, miejscowosc = ?, kod_pocztowy = ?, ulica = ?, nr_domu = ? WHERE user_id = ? LIMIT 1",[
      $_POST["kraj_i"], $_POST["miejscowosc_i"], $_POST["kod_pocztowy_i"], $_POST["ulica_i"], $_POST["nr_domu_i"], $user_id
    ]);
  }

  if ($user_type != 's') {
    query("UPDATE users SET email = ? WHERE user_id = ? LIMIT 1",[
      $_POST["email"], $user_id
    ]);
  }

  if ($_POST["buyer_type"] == 'f')
  {
    query("UPDATE users SET firma = ?, nip = ?, email = ?, telefon = ? WHERE user_id = ? LIMIT 1",[
      $_POST["firma"], $_POST["nip"], $_POST["email"], $_POST["telefon"], $user_id
    ]);
  }
  else
  {
    query("UPDATE users SET imie = ?, nazwisko = ?, email = ?, telefon = ? WHERE user_id = ? LIMIT 1",[
      $_POST["imie"], $_POST["nazwisko"], $_POST["email"], $_POST["telefon"], $user_id
    ]);
  }
}

// send mail
$adresWho = $_POST["imie_d"]." ".$_POST["nazwisko_d"];
if ($_POST["firma_d"] != '') {
  $adresWho .= $_POST["firma_d"];
}

$kontaktAdresString =  $_POST["kod_pocztowy"]." ".$_POST["miejscowosc"].", ".$_POST["kraj"]."<br>".$_POST["ulica"].", ".$_POST["nr_domu"].($_POST["nr_lokalu"] ? "/" : "").$_POST["nr_lokalu"];

$dostawaAdresString =  $_POST["kod_pocztowy_dostawa"]." ".$_POST["miejscowosc_dostawa"].", ".$_POST["kraj_dostawa"]."<br>".$_POST["ulica_dostawa"].", ".$_POST["nr_domu_dostawa"].($_POST["nr_lokalu_dostawa"] ? "/" : "").$_POST["nr_lokalu_dostawa"];

$dostawy = ["p"=>"Paczkomat","k"=>"Kurier","o"=>"Odbiór osobisty"];
$dostawaString = isset($dostawy[$_POST["dostawa"]]) ? $dostawy[$_POST["dostawa"]] : "";

//$data = date("dmY");
//$data = intval(substr($data,0,2))." ".$m_pol[intval(substr($data,2,2))-1]." ".substr($data,4,4);
$data = niceDate();

$message = "<h2>Potwierdzenie zamówienia #$zamowienie_id</h2>";

$message .= "<div style='font-size: 14px;'>";
$message .= "<table>";
if ($_POST["buyer_type"] == 'f')
{
  $message .= "<tr><td>Firma: </td><td>".$_POST["firma"]."</td></tr>";
  $message .= "<tr><td>NIP: </td><td>".$_POST["nip"]."</td></tr>";
}
else {
  $message .= "<tr><td>Imię i nazwisko: </td><td>".$_POST["imie"]." ".$_POST["nazwisko"]."</td></tr>";
}
$message .= "<tr><td>Nr telefonu: </td><td>".$_POST["telefon"]."</td></tr>";
$message .= "<tr><td style='vertical-align: top;'>Adres zamawiającego: </td><td>$kontaktAdresString</td></tr>";
$message .= "<tr><td>Data utworzenia: </td><td>$data</td></tr>";
$message .= "<tr><td style='vertical-align: top;'>Rodzaj dostawy: </td><td>$dostawaString ($koszt_dostawy zł)</td></tr>";
$message .= "<tr><td style='vertical-align: top;'>Adres dostawy: </td><td>$adresWho<div style='height: 7px;'></div>$dostawaAdresString</td></tr>";
$message .= "<tr><td>Koszt produktów: </td><td>".$app["user"]["basket"]["total_basket_cost"]." zł</td></tr>";
$message .= "<tr><td><b>Całkowity koszt zamówienia: </b></td><td><b>$koszt zł</b></td></tr>";
$message .= "</table>";

if ($_POST["uwagi"] != "") $message .= "<p><span style='text-decoration: underline;'>Uwagi dotyczące zamówienia:</span><br>".nl2br($_POST["uwagi"])."</p>";

$message .= "<h4 style='margin:20px 0 10px'>Szczegóły zamówienia</h4>";
$message .= $res;
$message .= "</div>";

$message .= '<p style="font-size: 16px;">Jeśli jeszcze nie opłaciłaś/eś Twojego zamówienia,<br>możesz to zrobić teraz korzystając <a href="'.$link.'" style="font-weight:bold;color:#60c216;">z tego linku</a></p>';
$message .= getEmailFooter();

$mailTitle = "Potwierdzenie zamówienia #$zamowienie_id - ".config('main_email_sender')."";

@sendEmail($_POST["email"], $message, $mailTitle);
@sendEmail(config('main_email'), $message, $mailTitle);

if ($_POST["forma_zaplaty"] == '24')
{
  require 'przelewy24/przelewy24_register_payment.php';
}
else
{
  header("Location: $link");
  die;
}