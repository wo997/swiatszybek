<?php //route[/cart/add-product]
/**
 * @posts {
 * product_id: number
 * qty: number
 * }
 */
// create a typedef in JS and based on route name set the type yay - not so yayish, maybe just go for unit tests or route tests lol

$cart = User::getCurrent()->getCart();
$cart->setProductQty($_POST["product_id"], $_POST["qty"]);
$cart->save();
Request::jsonResponse(["user_cart" => $cart->getAllData()]);
