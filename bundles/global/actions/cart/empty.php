<?php //route[/cart/empty]

$cart = User::getCurrent()->cart;
$cart->empty();
$cart->save();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
