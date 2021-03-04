<?php //hook[helper]

/**
 * getProductCategoryLink
 *
 * @param  number $product_category_id
 * @param  number[] $option_ids
 * @param  string $full_name
 * @param  string[] $options_names
 * @return string
 */
function getProductCategoryLink($product_category_id, $full_name, $option_ids = [], $options_names = [])
{
    $link = "/produkty";
    $link .= "/" . $product_category_id;
    $link .= "/" . escapeUrl(str_replace("/", " ", $full_name));
    if ($option_ids) {
        $link .= "/" . join("~", $option_ids);
    }
    // if ($options_names) {
    //     $link .= "/" . escapeUrl(join(" ", $options_names));
    // }
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
