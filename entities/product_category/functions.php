<?php //hook[helper]

/**
 * getProductCategoryLink
 *
 * @param  mixed $category_path
 * @param  number[] $option_ids
 * @return string
 */
function getProductCategoryLink($category_path, $option_ids = [])
{
    $category = end($category_path);
    $link = "/produkty";
    if ($category && $category["id"] !== -1) {
        $link .= "/" . $category["id"];
        $link .= "/" . escapeUrl(implode(" ", array_map(function ($x) {
            return $x["name"];
        }, $category_path)));
    }
    if ($option_ids) {
        $link .= "?v=" . join("-", $option_ids);
    }
    return $link;
}

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
