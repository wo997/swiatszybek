<?php //event[variant_price_change]

$product_data = fetchRow("SELECT MIN(price - rabat) min, MAX(price - rabat) max FROM variant WHERE product_id = " . intval($args["product_id"])  . " AND published");

query("UPDATE products SET price_min = ?, price_max = ? WHERE product_id = " . intval($args["product_id"]), [
    $product_data["min"], $product_data["max"]
]);
