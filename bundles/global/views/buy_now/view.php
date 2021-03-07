<?php //route[/kup-teraz]

if (empty(User::getCurrent()->cart->getProducts())) {
    Request::redirect("/");
}

?>

<?php startSection("head_content"); ?>

<title>Kup teraz</title>

<?php startSection("body_content"); ?>

<div class="buy_now_container">
    <h1 class="h1 mobile_view center">Kup teraz</h1>

    <div class="buy_products_wrapper">
        <div class="label big first">Koszyk</div>
        <cart-products-comp class="buy_products"></cart-products-comp>
    </div>

    <div class="buy_now_form">
        <h1 class="h1 desktop_view">Kup teraz</h1>

        <address-comp class="main_address"></address-comp>
        <div class="label big">Dostawa</div>
    </div>
</div>

<?php include "bundles/global/templates/default.php"; ?>