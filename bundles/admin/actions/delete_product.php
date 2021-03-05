<?php //route[{ADMIN}/delete_product]

$product_id = intval(Request::urlParam(2));

DB::execute("DELETE FROM products WHERE product_id = $product_id");

Request::redirect(Request::$static_urls["ADMIN"] . "produkty");
