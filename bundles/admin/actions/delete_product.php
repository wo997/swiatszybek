<?php //route[{ADMIN}delete_product]

$product_id = intval(urlParam(2));

DB::execute("DELETE FROM products WHERE product_id = $product_id");

redirect(STATIC_URLS["ADMIN"] . "produkty");
