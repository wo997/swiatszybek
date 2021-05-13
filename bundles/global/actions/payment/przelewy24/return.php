<?php //route[/payment/przelewy24/return]

// this route dodes pretty much nothing?

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

Request::redirect($shop_order->getProp("__url") . "/oplacono");
