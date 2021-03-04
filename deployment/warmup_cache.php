<?php

$args = [];
include "event_listeners/deployment/build.php";

foreach (DB::fetchCol("SELECT general_product_id FROM general_product") as $general_product_id) {
    $general_product = EntityManager::getEntityById("general_product", $general_product_id);
}
foreach (DB::fetchCol("SELECT product_category_id FROM product_category") as $product_category_id) {
    $product_category = EntityManager::getEntityById("product_category", $product_category_id);
}
EntityManager::saveAll();

// triggerEvent("sitemap_change");
triggerEvent("config_change");

triggerEvent("assets_change");
