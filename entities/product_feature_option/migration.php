<?php //hook[migration]

DB::createTable("product_feature_option", [
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "primary"],
    ["name" => "product_feature_id", "type" => "INT", "index" => "index"],
    ["name" => "parent_product_feature_option_id", "type" => "INT", "index" => "index", "default" => "-1"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);

DB::createTable("product_to_feature_option", [
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "index"],
]);

DB::createTable("general_product_to_feature_option", [
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "index"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);
