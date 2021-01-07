<?php

// also product.js
function getProductLink($product_id, $link)
{
    return SITE_URL . "/produkt/$product_id/" . escapeUrl($link);
}

function getProductsFullData($product_id_list)
{
    $product_id_list_string = clean(join(",", array_filter($product_id_list)));
    $where = "product_id IN ($product_id_list_string)";
    $order = "FIELD(product_id,$product_id_list_string)";

    if (!$product_id_list_string) {
        return [];
    }

    $product_list = fetchArray("SELECT product_id, title, link, cache_thumbnail, price_min, price_max FROM products WHERE $where ORDER BY $order");

    foreach ($product_list as $product_index => $product) {
        $product["full_link"] = getProductLink($product["product_id"], $product["link"]);
        $product_list[$product_index] = $product;
    }

    return $product_list;
}

function getVariantsFullData($variant_id_list)
{
    if (!$variant_id_list) {
        return [];
    }

    $variant_id_list_string = clean(join(",", $variant_id_list));
    $where = "variant_id IN ($variant_id_list_string)";
    $order = "FIELD(variant_id,$variant_id_list_string)";

    $variant_list = fetchArray("SELECT variant_id, product_id, title, link, name, zdjecie, price, rabat, stock, gallery FROM products i INNER JOIN variant v USING (product_id) WHERE $where ORDER BY $order");

    foreach ($variant_list as $variant_index => $variant) {
        // maybe move to cache? not the greatest idea though
        $variant["real_price"] = $variant["price"] - $variant["rabat"];
        $variant["full_link"] = getProductLink($variant["product_id"], $variant["link"]);
        $variant_list[$variant_index] = $variant;
    }

    return $variant_list;
}
