<?php //event[product_gallery_change]

$gallery = fetchValue("SELECT gallery FROM products WHERE product_id = " . intval($args["product_id"]));

$galleryJSON = json_decode($gallery, true);

if ($galleryJSON) {
    query("UPDATE products SET cache_thumbnail = ? WHERE product_id = " . intval($args["product_id"]), [
        $galleryJSON[0]["values"]["src"]
    ]);
}
