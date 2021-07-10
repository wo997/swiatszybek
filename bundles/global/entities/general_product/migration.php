<?php //hook[migration]

DB::createTable("general_product", [
    ["name" => "general_product_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "active", "type" => "TINYINT(1)", "index" => "index"],
    ["name" => "product_type", "type" => "VARCHAR(15)", "index" => "index"],

    ["name" => "sell_by", "type" => "VARCHAR(15)"],
    ["name" => "base_unit", "type" => "VARCHAR(15)"],
    ["name" => "qty_step", "type" => "DECIMAL(10,2)"],

    ["name" => "__img_url", "type" => "VARCHAR(255)"],
    ["name" => "__images_json", "type" => "TEXT"],
    ["name" => "__options_json", "type" => "TEXT"],
    ["name" => "__search", "type" => "TEXT"],
    ["name" => "__url", "type" => "VARCHAR(255)"],
    ["name" => "__features_html", "type" => "TEXT"],
    ["name" => "compare_sales", "type" => "INT", "index" => "index"],
]);

// DB::update("general_product", ["product_type" => "normal"], "product_type = ''");
