<?php //route[przelewy24_pay]

$zamowienie_link = nonull($url_params, 1);
if (!$zamowienie_link) {
  header("Location: " . $zamowienie_data["link"]); // fail
  die;
}

require_once __DIR__ . "/przelewy24_service.php";

$P24 = new Przelewy24(secret("p24_merchantId"), secret("p24_posId"), secret("p24_crc"), secret("p24_testMode"));
//$RET = $P24->testConnection();
/*if(isset($RET["error"]) && $RET["error"]==='0') {
  echo "przelewy24 connected";
} else {
  var_dump("connect",$RET); die;
}*/

// set auth token
query("UPDATE zamowienia SET session_id = ? WHERE link = ?", [$zamowienie_link . "-" . uniqid(), $zamowienie_link]);

$zamowienie_data = fetchRow("SELECT * FROM zamowienia WHERE link = ?", [$zamowienie_link]);

if ($zamowienie_data["status"] === 0) {
  $link = getZamowienieLink($zamowienie_data["link"]);

  $P24->addValue("p24_session_id", $zamowienie_data["session_id"]);
  $P24->addValue("p24_merchant_id", secret("p24_merchantId"));
  $P24->addValue("p24_pos_id", secret("p24_posId"));

  $P24->addValue("p24_amount", round($zamowienie_data["koszt"] * 100));
  $P24->addValue("p24_currency", $currency);

  $P24->addValue("p24_description", config('main_email_sender') . " zamowienie #" . $zamowienie_data["zamowienie_id"]);
  $P24->addValue("p24_client", $zamowienie_data["imie"] . " " . $zamowienie_data["nazwisko"]);
  $P24->addValue("p24_address", "ul. " . $zamowienie_data["ulica"] . " " . $zamowienie_data["nr_domu"] . "/" . $zamowienie_data["nr_lokalu"]);
  $P24->addValue("p24_zip", $zamowienie_data["kod_pocztowy"]);
  $P24->addValue("p24_city", $zamowienie_data["miejscowosc"]);
  $P24->addValue("p24_country", $zamowienie_data["kraj"]);

  $P24->addValue("p24_email", trim($zamowienie_data["email"]));
  $P24->addValue("p24_url_return", $link);
  $P24->addValue("p24_url_status", SITE_URL . "/przelewy24_confirm_payment");
  $P24->addValue("p24_api_version", "3.2");
  $P24->addValue("p24_channel", "2");

  $RET = $P24->trnRegister(false);

  if (isset($RET["token"])) {
    $przelewy24_token = $RET["token"];
    //query("UPDATE zamowienia SET przelewy24_token = ? WHERE zamowienie_id = ? LIMIT 1", [$przelewy24_token, $zamowienie_id]); // do we ever use it? idk
    $url = "https://" . (secret("p24_testMode") ? "sandbox" : "secure") . ".przelewy24.pl/trnRequest/" . $przelewy24_token;

    $_SESSION["p24_back_url"] = $link;
    header("Location: $url");
    die;
  } else {
    header("Location: " . $zamowienie_data["link"]); // fail
    die;
  }
}
