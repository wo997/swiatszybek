<?php //event[product_gallery_change]

$gallery = DB::fetchVal("SELECT gallery FROM products WHERE product_id = " . intval($args["product_id"]));

$galleryJSON = json_decode($gallery, true);

if ($galleryJSON) {
    DB::execute("UPDATE products SET cache_thumbnail = ? WHERE product_id = " . intval($args["product_id"]), [
        $galleryJSON[0]["src"]
    ]);
}
