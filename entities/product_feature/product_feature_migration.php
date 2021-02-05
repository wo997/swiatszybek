<?php //hook[migration]

DB::createTable("product_feature", [
    ["name" => "product_feature_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
]);

// shouldn't be below but does anyone care?
DB::createTable("product_to_feature", [
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_id", "type" => "INT", "index" => "index"],
]);

DB::beginTransaction();
EntityManager::getEntity("product", [
    "" => ""
]);

DB::rollbackTransation();
