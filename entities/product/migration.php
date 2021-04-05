<?php //hook[migration]

DB::createTable("product", [
    ["name" => "product_id", "type" => "INT", "index" => "primary"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "net_price", "type" => "DECIMAL(10,2)"],
    ["name" => "gross_price", "type" => "DECIMAL(10,2)", "index" => "index"],
    ["name" => "vat_id", "type" => "INT"],
    ["name" => "active", "type" => "TINYINT(1)"],
    ["name" => "stock", "type" => "INT"],
    ["name" => "weight", "type" => "DECIMAL(10,2)"],
    ["name" => "length", "type" => "DECIMAL(10,2)"],
    ["name" => "width", "type" => "DECIMAL(10,2)"],
    ["name" => "height", "type" => "DECIMAL(10,2)"],
    ["name" => "__img_url", "type" => "VARCHAR(255)"],
    ["name" => "__name", "type" => "VARCHAR(255)"],
    ["name" => "__options_json", "type" => "TEXT"],
    ["name" => "__url", "type" => "VARCHAR(255)"],
]);
