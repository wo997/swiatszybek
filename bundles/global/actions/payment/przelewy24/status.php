<?php //route[/payment/przelewy24/status]  

$payment_id = Request::urlParam(3);
$payment = EntityManager::getEntityById("payment", $payment_id);

if (!$payment) {
    Request::redirect("/");
}

/** @var Entity ShopOrder */
$shop_order = $payment->getProp("shop_order");

if (!$shop_order) {
    Request::redirect("/");
}

$p24 = Przelewy24::get();

$p24_session_id = $_POST["p24_session_id"];
$p24_order_id = $_POST["p24_order_id"];

$p24->addValue("p24_session_id", $p24_session_id);
$p24->addValue("p24_amount", round($shop_order->getProp("total_price") * 100));
$p24->addValue("p24_currency", "PLN");
$p24->addValue("p24_order_id", $p24_order_id);

$RET = $p24->trnVerify();

//sendEmail("wojtekwo997@gmail.com", json_encode($RET), "p24");

if (isset($RET["error"]) && $RET["error"] === '0') {
    $shop_order->setProp("status", 2);
    $payment->setProp("payment_order_id", $p24_order_id);
    $payment->setProp("payment_status_id", 1);

    $payment->setProp("paid_at", date("Y-m-d H:i:s"));

    // TODO: DO IT
    //addZamowienieLog("Opłacono przez Przelewy24 - " . $zamowienie_data["koszt"] . " zł", $zamowienie_data["zamowienie_id"]); 
}

EntityManager::saveAll();
DB::commitTransaction();
die;
