<?php //route[{ADMIN}produkt]

$general_product_id = Request::urlParam(2, -1);

$general_product = EntityManager::getEntityById("general_product", $general_product_id);

$general_product_data = $general_product->getSimpleProps();

/** @var Entity[] */
$products = $general_product->getProp("products");
$pd = [];
foreach ($products as $product) {
    $pd[] = $product->getSimpleProps();
}
$general_product_data["products"] = $pd;
?>

<?php startSection("head_content"); ?>

<title>Produkt</title>

<script>
    let product_features = <?= json_encode(getAllProductFeatures()) ?>;
    let product_feature_options = <?= json_encode(getAllProductFeatureOptions()) ?>;
    let general_product_data = <?= json_encode($general_product_data) ?>;
    let vats = [{
            vat_id: 1,
            value: 0.23
        },
        {
            vat_id: 2,
            value: 0.08
        },
        {
            vat_id: 3,
            value: 0.05
        },
    ];
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