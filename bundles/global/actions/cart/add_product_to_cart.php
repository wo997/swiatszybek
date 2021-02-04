<?php //route[add_product_to_cart]
/**
 * @posts {
 * product_id: number
 * qty: number
 * }
 */
// create a typedef in JS and based on route name set the type yay

$cart = User::getCurrent()->cart;
$cart->setProductQty($_POST["product_id"], $_POST["qty"]);
Request::jsonResponse(["cart" => $cart->getProducts()]);
