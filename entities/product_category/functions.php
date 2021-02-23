<?php //hook[helper]

function getAllProductCategories()
{
    return DB::fetchArr("SELECT * FROM product_category");
}

function preloadProductCategories()
{
    $product_categories = json_encode(getAllProductCategories());
    return <<<JS
    product_categories = $product_categories;
    loadedProductCategories();
JS;
}
