<?php


define("LAST_VIEWED_PRODUCTS_LENGTH_LIMIT", 50);

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
