<?php

define("LAST_VIEWED_PRODUCTS_LENGTH_LIMIT", 50);

$attribute_data_types = [
    "textlist" => [
        "description" => "Tekst (lista)",
    ],
    "numberlist" => [
        "description" => "Liczba (lista)",
    ],
    "colorlist" => [
        "description" => "Kolor (lista)"
    ],
    "numberany" => [
        "description" => "Liczba (dowolna)",
        "field" => "numerical_value"
    ],
    "dateany" => [
        "description" => "Data (dowolna)",
        "field" => "date_value"
    ],
    "textany" => [
        "description" => "Tekst (dowolny)",
        "field" => "text_value"
    ],
    /*"integer" => [
    "description" => "Liczba całkowita",
  ],
  "decimal" => [  
    "description" => "Liczba zmiennoprzecinkowa",
  ]*/
];

// also product.js
function getProductLink($product_id, $link)
{
    return SITE_URL . "/produkt/$product_id/" . getLink($link);
}

function getLastViewedProductsIds()
{
    global $PRODUCT_ID;
    $last_viewed_product_ids = json_decode(nonull($_SESSION, "last_viewed_products", "[]"), true);
    if (($last_viewed_product_id_index = array_search($PRODUCT_ID, $last_viewed_product_ids)) !== false) {
        array_splice($last_viewed_product_ids, $last_viewed_product_id_index, 1);
    }
    return array_filter($last_viewed_product_ids);
}

function setLastViewedProductsIds($last_viewed_products_json_or_array)
{
    global $app;

    if (is_array($last_viewed_products_json_or_array)) {
        $last_viewed_products = $last_viewed_products_json_or_array;
    } else {
        $last_viewed_products = json_decode($last_viewed_products_json_or_array);
    }

    $last_viewed_products = array_filter($last_viewed_products);

    $last_viewed_products_json = json_encode($last_viewed_products);

    $_SESSION["last_viewed_products"] = $last_viewed_products_json;
    setcookie("last_viewed_products", $last_viewed_products_json, (time() + 31536000));

    if ($app["user"]["id"]) {
        query("UPDATE users SET last_viewed_products = ? WHERE user_id = ?", [
            $last_viewed_products_json, $app["user"]["id"]
        ]);
    }
}

function addLastViewedProducts($product_ids, $as_new = true)
{
    $last_viewed_products = getLastViewedProductsIds();

    foreach ($product_ids as $product_id) {
        while (true) {
            $last_viewed_product_index = array_search($product_id, $last_viewed_products);
            if ($last_viewed_product_index === false) {
                break;
            }
            array_splice($last_viewed_products, $last_viewed_product_index, 1);
        }
        if ($as_new) {
            array_unshift($last_viewed_products, $product_id); // begin
        } else {
            $last_viewed_products[] = $product_id; // end
        }
    }

    // limit results
    if (count($last_viewed_products) > LAST_VIEWED_PRODUCTS_LENGTH_LIMIT) {
        array_splice($last_viewed_products, LAST_VIEWED_PRODUCTS_LENGTH_LIMIT);
    }

    setLastViewedProductsIds($last_viewed_products);
}

function getLastViewedProducts()
{
    return getProductsFullData(getLastViewedProductsIds(), true);
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
        $variant["real_price"] = $variant["price"] - $variant["rabat"];
        $variant["full_link"] = getProductLink($variant["product_id"], $variant["link"]);
        $variant_list[$variant_index] = $variant;
    }

    return $variant_list;
}
