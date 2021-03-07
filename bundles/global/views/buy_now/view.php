<?php //route[/kup-teraz]

if (empty(User::getCurrent()->cart->getProducts())) {
    Request::redirect("/");
}

?>

<?php startSection("head_content"); ?>

<title>Kup teraz</title>

<?php startSection("body_content"); ?>

<h1>Kup teraz</h1>

hey maybe it should also be an absolute layout cause why not ;)
<cart-products-comp class="buy_products"></cart-products-comp>

<div class="buy_now_form">
    <address-comp class="main_address"></address-comp>

</div>

<?php include "bundles/global/templates/default.php"; ?>