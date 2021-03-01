<?php //hook[migration]

DB::createTable("product", [
    ["name" => "product_id", "type" => "INT", "index" => "primary"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "net_price", "type" => "DECIMAL(10,2)"],
    ["name" => "gross_price", "type" => "DECIMAL(10,2)", "index" => "index"],
    ["name" => "vat_id", "type" => "INT"],
    ["name" => "active", "type" => "TINYINT(1)"],
    ["name" => "stock", "type" => "INT"],
    ["name" => "__img_url", "type" => "VARCHAR(255)"],
    ["name" => "__full_name", "type" => "VARCHAR(255)"],
]);
