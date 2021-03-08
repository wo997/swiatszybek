<?php //route[/cart/deactivate-rebate-code]

$cart = User::getCurrent()->cart;
$cart->deactivateRebateCode($_POST["rebate_code"]);
$cart->saveCart();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
