<?php //hook[migration]

DB::createTable("general_product", [
    ["name" => "general_product_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "active", "type" => "TINYINT(1)", "index" => "index"],
    ["name" => "__img_url", "type" => "VARCHAR(255)"],
    ["name" => "__images_json", "type" => "TEXT"],
    ["name" => "__options_json", "type" => "TEXT"],
    ["name" => "__search", "type" => "TEXT"],
    ["name" => "__url", "type" => "VARCHAR(255)"],
    ["name" => "__features_html", "previous_name" => "__options_html", "type" => "TEXT"],
]);
