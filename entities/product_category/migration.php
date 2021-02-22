<?php //hook[migration]

DB::createTable("product_category", [
    ["name" => "product_category_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);

DB::createTable("general_product_to_category", [
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_category_id", "type" => "INT", "index" => "index"],
]);
