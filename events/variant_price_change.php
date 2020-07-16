<?php

$product_data = fetchRow("SELECT MIN(price - rabat) min, MAX(price - rabat) max FROM variant WHERE product_id = " . intval($input["product_id"]));

query("UPDATE products SET price_min = ?, price_max = ? WHERE product_id = " . intval($input["product_id"]), [
    $product_data["min"], $product_data["max"] == $product_data["min"] ? NULL : $product_data["max"]
]);
