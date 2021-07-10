<?php //route[/cart/remove-product]

$cart = User::getCurrent()->getCart();
$cart->removeProduct($_POST["product_id"]);
$cart->save();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
