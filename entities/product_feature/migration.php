<?php //hook[migration]

DB::createTable("product_feature", [
    ["name" => "product_feature_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
    ["name" => "data_type", "type" => "VARCHAR(255)"],

]);

DB::createTable("general_product_to_feature", [
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_id", "type" => "INT", "index" => "index"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);
