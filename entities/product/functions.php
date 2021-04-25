<?php //hook[helper]

/**
 * getProductLink
 *
 * @param  number $general_product_id
 * @param  number[] $option_ids
 * @param  string $name
 * @param  string[] $options_names
 * @return string
 */
function getProductLink($general_product_id, $name, $option_ids = [], $options_names = [])
{
    $link = "/produkt";
    $link .= "/" . $general_product_id;
    $link .= "/" . escapeUrl($name . " " . join(" ", $options_names));
    if ($option_ids) {
        $link .= "?v=" . join("-", $option_ids);
    }
    return $link;
}

function getAllProducts()
{
    return DB::fetchArr("SELECT * FROM product");
}

function preloadProducts()
{
    $products = json_encode(getAllProducts());
    return <<<JS
    products = $products;
    loadedProducts();
JS;
}
