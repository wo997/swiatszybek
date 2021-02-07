<?php //route[{ADMIN}produkt]

?>

<?php startSection("head_content"); ?>

<title>Produkt</title>

<script>
    let product_features = <?= json_encode(getAllProductFeatures()) ?>;
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title breadcrumbs">
        <a class="btn transparent crumb" href="/admin/produkty">
            Produkty
        </a>
        <i class="fas fa-chevron-right"></i>
        <div class="crumb">
            Produkt
            <span class="product_name"></span>
        </div>
    </span>
    <button class="btn primary" onclick="saveProduct()">Zapisz <i class="fas fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>

<product-comp></product-comp>

<?php include "admin/page_template.php"; ?>