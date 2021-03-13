<?php //hook[migration]

DB::createTable("general_product", [
    ["name" => "general_product_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "__img_url", "type" => "VARCHAR(255)"],
    ["name" => "__images_json", "type" => "TEXT"],
    ["name" => "__options_json", "type" => "TEXT"],
    ["name" => "__search", "type" => "TEXT"],
]);
