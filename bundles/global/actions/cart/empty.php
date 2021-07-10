<?php //route[/cart/empty]

$cart = User::getCurrent()->getCart();
$cart->empty();
$cart->save();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
