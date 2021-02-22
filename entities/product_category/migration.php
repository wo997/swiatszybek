<?php //hook[migration]

DB::createTable("product_category", [
    ["name" => "product_category_id", "type" => "INT", "index" => "primary"],
    ["name" => "parent_product_category_id", "type" => "INT", "index" => "index", "default" => "-1"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);

DB::createTable("general_product_to_category", [
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_category_id", "type" => "INT", "index" => "index"],
]);
