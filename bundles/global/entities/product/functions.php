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
    return DB::fetchArr("SELECT p.active, p.general_product_id, p.gross_price, p.net_price, p.vat_id, p.stock, p.weight,
        p.width, p.length, p.height, p.product_id, p.__img_url, p.__name, p.__options_json, p.__queue_count, p.__url, p.__current_gross_price,
        
        gp.active gp_active, gp.name gp_name, gp.product_type gp_product_type, gp.__avg_rating gp__avg_rating,
        gp.__features_html gp__features_html, gp.__images_json gp__images_json, gp.__img_url gp__img_url,
        gp.__options_json gp__options_json, gp.__rating_count gp__rating_count, gp.__search gp__search, gp.__url gp__url
        
        FROM product p LEFT JOIN general_product gp USING(general_product_id)");
}

function preloadProducts()
{
    $products = json_encode(getAllProducts());
    return <<<JS
    products = $products;
    loadedProducts();
JS;
}

function setProductDefaults($product_id)
{
    $product = EntityManager::getEntityById("product", $product_id);

    $name = $product->getProp("name");
    $img_url = $product->getProp("img_url");

    if ($name) {
        $product->setProp("__name", $name);
    }
    if ($img_url) {
        $product->setProp("__img_url", $img_url);
    }
}
