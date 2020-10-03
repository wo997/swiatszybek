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


function getProductLink($product_id, $link)
{
    return SITE_URL . "/produkt/$product_id/" . getLink($link);
}

function addLastViewedProduct($product_id)
{
    global $app;

    $last_viewed_products = json_decode(nonull($_SESSION, "last_viewed_products", "[]"), true);

    while (true) {
        $last_viewed_product_index = array_search($product_id, $last_viewed_products);
        if ($last_viewed_product_index === false) {
            break;
        }
        array_splice($last_viewed_products, $last_viewed_product_index, 1);
    }
    array_unshift($last_viewed_products, $product_id);

    // limit results
    $length = count($last_viewed_products);
    if (count($last_viewed_products) > LAST_VIEWED_PRODUCTS_LENGTH_LIMIT) {
        array_splice($last_viewed_products, LAST_VIEWED_PRODUCTS_LENGTH_LIMIT);
    }

    $last_viewed_products_json = json_encode($last_viewed_products);

    $_SESSION["last_viewed_products"] = $last_viewed_products_json;
    setcookie("last_viewed_products", $last_viewed_products_json, (time() + 31536000));

    if ($app["user"]["id"]) {
        query("UPDATE users SET last_viewed_products = ? WHERE user_id = ?", [
            $last_viewed_products_json, $app["user"]["id"]
        ]);
    }
}
