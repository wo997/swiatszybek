<?php //route[/cart/activate-rebate-code]

$cart = User::getCurrent()->getCart();
$data = $cart->activateRebateCode($_POST["rebate_code"]);
$data["data"]["user_cart"] = $cart->getAllData();
$cart->save();
Request::jsonResponse($data);
