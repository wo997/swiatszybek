<?php //route[/payment/przelewy24/shop_order/pay]  

$shop_order_id = intval(Request::urlParam(4));
$shop_order = EntityManager::getEntityById("shop_order", $shop_order_id);

if (!$shop_order) {
    Request::redirect("/");
}

$p24 = Przelewy24::get();

// TEMPORARY
// $RET = $p24->testConnection();
// if (isset($RET["error"]) && $RET["error"] === '0') {
//     echo "przelewy24 connected";
// } else {
//     var_dump("connectopn error", $RET);
// }
// die;

DB::beginTransaction();

$session_id = $shop_order_id . "_"
    . DB::fetchVal("SELECT count(1) FROM payment WHERE payment_name = 'p24' AND shop_order_id = $shop_order_id")
    . "_" . Security::generateToken(32);

$payment =  EntityManager::getEntity("payment", [
    "payment_id" => -1,
    "payment_name" => "p24",
    "payment_status_id" => 0,
    "shop_order" => $shop_order_id,
    "session_id" => $session_id
]);

$payment_id = $payment->getId();

/** @var Entity Address */
$main_address = $shop_order->getProp("main_address");

$p24->addValue("p24_session_id", $session_id);
$p24->addValue("p24_merchant_id", def($p24::$settings, "p24_merchant_id"));
$p24->addValue("p24_pos_id", def($p24::$settings, "p24_pos_id"));

$p24->addValue("p24_amount", round($shop_order->getProp("total_price") * 100));
$p24->addValue("p24_currency", "PLN");

$p24->addValue("p24_description", getShopName() . " zamowienie #$shop_order_id");
$p24->addValue("p24_client", $main_address->getProp("__display_name"));
$p24->addValue("p24_address", $main_address->getProp("__address_line_1"));
$p24->addValue("p24_zip", $main_address->getProp("post_code"));
$p24->addValue("p24_city", $main_address->getProp("city"));
$p24->addValue("p24_country", $main_address->getProp("country"));

$p24->addValue("p24_email", $main_address->getProp("email"));
$p24->addValue("p24_url_return", SITE_URL . "/payment/przelewy24/return/$payment_id");
$p24->addValue("p24_url_status", SITE_URL . "/payment/przelewy24/status/$payment_id");
$p24->addValue("p24_api_version", "3.2");
$p24->addValue("p24_channel", "2");

$RET = $p24->trnRegister(false);

$token = def($RET, ["token"]);
$redirect_url = null;
if (isset($RET["token"])) {
    $redirect_url = $p24->trnRequest($RET["token"], false);
    EntityManager::saveAll();
    DB::commitTransaction();

    Request::setReturnUrl($shop_order->getProp("__url"));
} else {
    // var_dump("connection error", $RET);
    DB::rollbackTransation();
    $redirect_url = $shop_order->getProp("__url");
}

Request::redirect($redirect_url);
