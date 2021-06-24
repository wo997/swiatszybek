<?php //hook[migration]

DB::createTable("product_variant_option", [
    ["name" => "product_variant_option_id", "type" => "INT", "index" => "primary"],
    ["name" => "product_variant_id", "type" => "INT", "index" => "index"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT"],
    ["name" => "__feature_options_json", "type" => "TEXT"],
]);

DB::createTable("product_to_variant_option", [
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_variant_option_id", "type" => "INT", "index" => "index"],
]);

DB::createTable("product_variant_option_to_feature_option", [
    ["name" => "product_variant_option_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "index"],
]);
