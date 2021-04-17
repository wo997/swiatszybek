<?php //route[/cart/set_delivery_type]

$cart = User::getCurrent()->cart;
$cart->setDeliveryTypeId($_POST["delivery_type_id"]);
$cart->save();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
