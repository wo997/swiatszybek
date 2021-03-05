<?php //route[/przelewy24/confirm_payment]

//{"p24_session_id":"18-c47e5da9cf13-5f2af133cef8f","p24_amount":"151600","p24_order_id":"305783848","p24_pos_id":"104861","p24_merchant_id":"104861","p24_method":"112","p24_currency":"PLN","p24_statement":"p24-F78-A38-F48","p24_sign":"5e53c276c5e1ed96d545a6da33ec6595"}

require_once __DIR__ . "/../przelewy24_init.php";

$zamowienie_data = DB::fetchRow("SELECT * FROM zamowienia WHERE session_id = ?", [$_POST["p24_session_id"]]);

$P24 = $app["przelewy24"];

$P24->addValue("p24_session_id", $zamowienie_data["session_id"]);
$P24->addValue("p24_amount", round($zamowienie_data["koszt"] * 100));
$P24->addValue("p24_currency", $currency);
$P24->addValue("p24_order_id", $_POST["p24_order_id"]);

$RET = $P24->trnVerify();

if (isset($RET["error"]) && $RET["error"] === '0') {
    triggerEvent("order_charged", ["zamowienie_data" => $zamowienie_data, "info" => "Opłacono przez Przelewy24 - " . $zamowienie_data["koszt"] . " zł"]);
}
