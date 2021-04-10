<?php //hook[migration]

DB::createTable("general_product_variant_option", [
    ["name" => "general_product_variant_option_id", "type" => "INT", "index" => "primary"],
    ["name" => "general_product_variant_id", "type" => "INT", "index" => "index"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "value", "type" => "VARCHAR(255)"],
]);

DB::createTable("product_to_general_product_variant_option", [
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "general_product_variant_option_id", "type" => "INT", "index" => "index"],
]);
