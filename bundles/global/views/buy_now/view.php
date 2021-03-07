<?php //route[/kup-teraz]

if (empty(User::getCurrent()->cart->getProducts())) {
    Request::redirect("/");
}

?>

<?php startSection("head_content"); ?>

<title>Kup teraz</title>

<?php startSection("body_content"); ?>

<div class="buy_now_wrapper">
    <h1 class="h1">Kup teraz</h1>

    <div class="label big center first">Koszyk</div>

    <div class="buy_products_wrapper">
        <cart-products-comp class="buy_products"></cart-products-comp>
    </div>

    <div class="buy_now_form">
        <address-comp class="main_address"></address-comp>

        <div class="label big center first">Dostawa</div>
    </div>
</div>

<?php include "bundles/global/templates/default.php"; ?>