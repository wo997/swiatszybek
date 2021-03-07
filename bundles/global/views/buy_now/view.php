<?php //route[/kup-teraz]

if (empty(User::getCurrent()->cart->getProducts())) {
    Request::redirect("/");
}

?>

<?php startSection("head_content"); ?>

<title>Kup teraz</title>

<?php startSection("body_content"); ?>

<h1>Kup teraz</h1>

<cart-products-comp class="buy_products"></cart-products-comp>

<?php include "bundles/global/templates/default.php"; ?>