<?php //route[/cart/set_carrier]

$cart = User::getCurrent()->cart;
$cart->setCarrierId($_POST["carrier_id"]);
$cart->save();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
