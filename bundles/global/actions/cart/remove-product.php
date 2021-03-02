<?php //route[cart/remove-product]

$cart = User::getCurrent()->cart;
$cart->removeProduct($_POST["product_id"]);
$cart->saveCart();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
