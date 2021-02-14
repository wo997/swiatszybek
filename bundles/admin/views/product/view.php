<?php //route[{ADMIN}produkt]

$general_product_id = Request::urlParam(2, -1);

$general_product = EntityManager::getEntityById("general_product", $general_product_id);

?>

<?php startSection("head_content"); ?>

<title>Produkt</title>

<script>
    let product_features = <?= json_encode(getAllProductFeatures()) ?>;
    let product_feature_options = <?= json_encode(getAllProductFeatureOptions()) ?>;
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
    <div class="save_btn_wrapper"></div>
</div>

<?php startSection("body_content"); ?>

<product-comp></product-comp>

<?php include "admin/page_template.php"; ?>