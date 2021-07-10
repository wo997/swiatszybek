<?php //route[/cart/set_payment_time]

$cart = User::getCurrent()->getCart();
$cart->setPaymentTime($_POST["payment_time"]);
$cart->save();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
