<?php //route[/przelewy24_pay]

$zamowienie_link = Request::urlParam(1);
if (!$zamowienie_link) {
    header("Location: " . $zamowienie_data["link"]); // fail
    die;
}

//$RET = $P24->testConnection();
/*if(isset($RET["error"]) && $RET["error"]==='0') {
  echo "przelewy24 connected";
} else {
  var_dump("connect",$RET); die;
}*/

// set auth token
DB::execute("UPDATE zamowienia SET session_id = ? WHERE link = ?", [$zamowienie_link . "-" . uniqid(), $zamowienie_link]);

$zamowienie_data = DB::fetchRow("SELECT * FROM zamowienia WHERE link = ?", [$zamowienie_link]);

if ($zamowienie_data["status_id"] === 0) {
    require_once __DIR__ . "/../przelewy24_init.php";

    $P24 = $app["przelewy24"];

    $link = getZamowienieLink($zamowienie_data["link"]);

    $P24->addValue("p24_session_id", $zamowienie_data["session_id"]);
    $P24->addValue("p24_merchant_id", secret("p24_merchantId"));
    $P24->addValue("p24_pos_id", secret("p24_posId"));

    $P24->addValue("p24_amount", round($zamowienie_data["koszt"] * 100));
    $P24->addValue("p24_currency", $currency);

    $P24->addValue("p24_description", $app["company_data"]['shop_name'] . " zamowienie #" . $zamowienie_data["zamowienie_id"]);
    /*$P24->addValue("p24_client", $zamowienie_data["imie"] . " " . $zamowienie_data["nazwisko"]);
  $P24->addValue("p24_address", "ul. " . $zamowienie_data["ulica"] . " " . $zamowienie_data["nr_domu"] . "/" . $zamowienie_data["nr_lokalu"]);
  $P24->addValue("p24_zip", $zamowienie_data["kod_pocztowy"]);
  $P24->addValue("p24_city", $zamowienie_data["miejscowosc"]);
  $P24->addValue("p24_country", $zamowienie_data["kraj"]);*/

    $P24->addValue("p24_email", trim($zamowienie_data["email"]));
    $P24->addValue("p24_url_return", $link);
    $P24->addValue("p24_url_status_id", SITE_URL . "/przelewy24_confirm_payment");
    $P24->addValue("p24_api_version", P24_VERSION);
    $P24->addValue("p24_channel", "2");

    $RET = $P24->trnRegister(false);

    if (isset($RET["token"])) {
        $przelewy24_token = $RET["token"];
        //DB::execute("UPDATE zamowienia SET przelewy24_token = ? WHERE zamowienie_id = ? LIMIT 1", [$przelewy24_token, $zamowienie_id]); // do we ever use it? idk
        $url = "https://" . (secret("p24_testMode") ? "sandbox" : "secure") . ".przelewy24.pl/trnRequest/" . $przelewy24_token;

        $_SESSION["p24_back_url"] = $link;
        Request::redirect($url);
    } else {
        // fail
        Request::redirect($zamowienie_data["link"]);
    }
}
