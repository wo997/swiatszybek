<?php //route[{ADMIN}delete_product]

$urlParts = explode("/", $url);

$product_id = intval($urlParts[2]);

query("DELETE FROM products WHERE product_id = $product_id");

redirect(STATIC_URLS["ADMIN"] . "produkty");
