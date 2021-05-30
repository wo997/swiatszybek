<?php //route[{ADMIN}/produkt]

$general_product_data = null;

$general_product_id = intval(Request::urlParam(2, -1));

if ($general_product_id !== -1) {
    // cleanup - it's risky af, dont remove items here that someone is just editing, done on saving instead
    // {
    //     $product_variant_ids = DB::fetchCol("SELECT product_variant_id FROM product_variant WHERE general_product_id = $general_product_id AND pos = 0");
    //     foreach ($product_variant_ids as $product_variant_id) {
    //         $product_variant = EntityManager::getEntityById("product_variant", $product_variant_id);
    //         $product_variant->setWillDelete();
    //     }

    //     $product_variant_option_ids = DB::fetchCol("SELECT product_variant_option_id FROM product_variant_option pvo INNER JOIN product_variant USING(product_variant_id) WHERE general_product_id = $general_product_id AND pvo.pos = 0");
    //     foreach ($product_variant_option_ids as $product_variant_option_id) {
    //         $product_variant_option = EntityManager::getEntityById("product_variant_option", $product_variant_option_id);
    //         $product_variant_option->setWillDelete();
    //     }

    //     EntityManager::saveAll();
    //     EntityManager::reset();
    // }

    $general_product = EntityManager::getEntityById("general_product", $general_product_id);

    if ($general_product) {
        $general_product_data = $general_product->getAllProps();

        /** @var Entity[] */
        $products = $general_product->getProp("products");
        $pd = [];
        foreach ($products as $product) {
            $pd[] = filterArrayKeys($product->getSimpleProps(), [
                "general_product_id",
                "net_price",
                "gross_price",
                "vat_id",
                "active",
                "stock",
                "weight",
                "length",
                "width",
                "height",
                "product_id",
                "variant_options",
            ]);
        }
        $general_product_data["products"] = $pd;
    }
}

if (!$general_product_data) {
    Request::redirect(Request::$static_urls["ADMIN"] . "/produkty");
}

?>

<?php Templates::startSection("head_content"); ?>

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

<?php Templates::startSection("header"); ?>

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
    <div class="inject_header_nodes mla"></div>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<product-comp></product-comp>

<?php include "bundles/admin/templates/default.php"; ?>