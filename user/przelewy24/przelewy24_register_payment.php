<?php 
require_once 'user/przelewy24/przelewy24.php';

$P24 = new Przelewy24(secret("p24_merchantId"), secret("p24_posId"), secret("p24_crc"), secret("p24_testMode"));
//$RET = $P24->testConnection();
/*if(isset($RET["error"]) && $RET["error"]==='0') {
  echo "przelewy24 connected";
} else {
  var_dump("connect",$RET); die;
}*/

//$zamowienie_data = fetchRow("SELECT zamowienie_id, link, basket, koszt, zlozono, oplacono, status, imie, nazwisko, email, telefon, firma, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, dostawa, uwagi, koszt_dostawy, session_id, przelewy24_token FROM zamowienia WHERE zamowienie_id = ?",[$zamowienie_id]);
$zamowienie_data = fetchRow("SELECT * FROM zamowienia WHERE zamowienie_id = ?",[$zamowienie_id]);

$link = getZamowienieLink($zamowienie_data["link"]);

$P24->addValue("p24_session_id",$zamowienie_data["session_id"]);
$P24->addValue("p24_merchant_id",secret("p24_merchantId"));
$P24->addValue("p24_pos_id",secret("p24_posId"));

$P24->addValue("p24_amount",round($zamowienie_data["koszt"] * 100));
$P24->addValue("p24_currency",$currency);

$P24->addValue("p24_description",config('main_email_sender')." zamowienie #".$zamowienie_data["zamowienie_id"]);
$P24->addValue("p24_client",$zamowienie_data["imie"]." ".$zamowienie_data["nazwisko"]);
$P24->addValue("p24_address","ul. ".$zamowienie_data["ulica_z"]." ".$zamowienie_data["nr_domu_z"]."/".$zamowienie_data["nr_lokalu_z"]);
$P24->addValue("p24_zip",$zamowienie_data["kod_pocztowy_z"]);
$P24->addValue("p24_city",$zamowienie_data["miejscowosc_z"]);
$P24->addValue("p24_country",$zamowienie_data["kraj_z"]);

$P24->addValue("p24_email",trim($zamowienie_data["email"]));
$P24->addValue("p24_url_return",$link);
$P24->addValue("p24_url_status",$link."/status");
$P24->addValue("p24_api_version","3.2");
$P24->addValue("p24_channel","2");

$RET = $P24->trnRegister(false);

if (isset($RET["token"]))
{
  $przelewy24_token = $RET["token"];
  query("UPDATE zamowienia SET przelewy24_token = ? WHERE zamowienie_id = ? LIMIT 1",[$przelewy24_token, $zamowienie_id]);

  $url = "https://".(secret("p24_testMode") ? "sandbox" : "secure").".przelewy24.pl/trnRequest/".$przelewy24_token;

  $_SESSION["p24_back_url"] = $link;
  header("Location: $url");
  die;
}
else {
  header("Location: ".$zamowienie_data["link"]); // fail
  die;
}


