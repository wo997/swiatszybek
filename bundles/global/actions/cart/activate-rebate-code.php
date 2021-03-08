<?php //route[/cart/activate-rebate-code]

$cart = User::getCurrent()->cart;
$data = $cart->activateRebateCode($_POST["rebate_code"]);
$data["user_cart"] = $cart->getAllData();
$cart->saveCart();
Request::jsonResponse($data);
