<?php //route[/cart/set_carrier]

$cart = User::getCurrent()->getCart();
$cart->setCarrierId($_POST["carrier_id"]);
$cart->save();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
