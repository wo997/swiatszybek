<?php

$args = [];
include "event_listeners/deployment/build.php";

foreach (fetchColumn("SELECT product_id FROM products") as $product_id) {
    triggerEvent("product_rating_change", ["product_id" => $product_id]);
    triggerEvent("product_gallery_change", ["product_id" => $product_id]);
    triggerEvent("variant_price_change", ["product_id" => $product_id]);
}

triggerEvent("topmenu_change");
triggerEvent("sitemap_change");
triggerEvent("config_change");

triggerEvent("assets_change");
