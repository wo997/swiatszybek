<?php //event[product_gallery_change]

$gallery = fetchValue("SELECT gallery FROM products WHERE product_id = " . intval($input["product_id"]));

query("UPDATE products SET cache_thumbnail = ? WHERE product_id = " . intval($input["product_id"]), [
    json_decode($gallery, true)[0]["values"]["src"]
]);
