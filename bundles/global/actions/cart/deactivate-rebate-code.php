<?php //route[/cart/deactivate-rebate-code]

$cart = User::getCurrent()->cart;
$cart->deactivateRebateCode($_POST["rebate_code"]);
$cart->save();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
