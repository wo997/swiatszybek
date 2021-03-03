<?php

$args = [];
include "event_listeners/deployment/build.php";

foreach (DB::fetchCol("SELECT general_product_id FROM general_product") as $general_product_id) {
    $general_product = EntityManager::getEntityById("general_product", $general_product_id);
    $general_product->save();
}

// foreach (DB::fetchCol("SELECT product_id FROM products") as $product_id) {
//     triggerEvent("product_rating_change", ["product_id" => $product_id]);
//     triggerEvent("product_gallery_change", ["product_id" => $product_id]);
//     triggerEvent("variant_price_change", ["product_id" => $product_id]);
// }

// triggerEvent("topmenu_change");
// triggerEvent("sitemap_change");
triggerEvent("config_change");

triggerEvent("assets_change");
