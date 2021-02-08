<?php //route[{ADMIN}produkt]

$general_product_id = Request::urlParam(2, -1);

$general_product = EntityManager::getEntityById("general_product", $general_product_id);

?>

<?php startSection("head_content"); ?>

<title>Produkt</title>

<script>
    let product_features = <?= json_encode(getAllProductFeatures()) ?>;
    let general_product_data = <?= json_encode($general_product->getSimpleProps()) ?>;
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title breadcrumbs">
        <a class="btn transparent crumb" href="/admin/produkty">
            Produkty
        </a>
        <i class="fas fa-chevron-right"></i>
        <div class="crumb">
            <span class="product_name"></span>
        </div>
    </span>
    <div class="history_btns_wrapper"></div>
    <button class="btn primary" onclick="saveProduct()">Zapisz <i class="fas fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>

<product-comp></product-comp>

<?php include "admin/page_template.php"; ?>