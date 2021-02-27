<?php //route[{ADMIN}produkt]

$general_product_id = intval(Request::urlParam(2, -1));

if ($general_product_id !== -1) {
    $general_product = EntityManager::getEntityById("general_product", $general_product_id);
    if (!$general_product) {
        Request::redirect(Request::$static_urls["ADMIN"] . "produkt");
    }

    $general_product_data = $general_product->getAllProps();

    /** @var Entity[] */
    $products = $general_product->getProp("products");
    $pd = [];
    foreach ($products as $product) {
        $pd[] = $product->getSimpleProps();
    }
    $general_product_data["products"] = $pd;
} else {
    $general_product_data = null;
}

?>

<?php startSection("head_content"); ?>

<title>Produkt</title>

<script>
    <?= preloadProductFeatures() ?>
    <?= preloadProductCategories() ?>
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

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <a class="btn transparent crumb" href="/admin/produkty">
            Produkty
        </a>
        <i class="fas fa-chevron-right"></i>
        <div class="crumb">
            <span class="product_name"></span>
        </div>
    </span>
    <div class="inject_header_nodes"></div>
</div>

<?php startSection("body_content"); ?>

<product-comp></product-comp>

<?php include "bundles/admin/templates/default.php"; ?>