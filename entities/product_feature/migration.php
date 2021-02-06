<?php //hook[migration]

DB::createTable("product_feature", [
    ["name" => "product_feature_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
]);

DB::createTable("product_to_feature", [
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_id", "type" => "INT", "index" => "index"],
]);
