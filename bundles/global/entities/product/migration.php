<?php //hook[migration]

DB::createTable("product", [
    ["name" => "product_id", "type" => "INT", "index" => "primary"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index", "null" => true],
    ["name" => "active", "type" => "TINYINT(1)"],
    ["name" => "sell_by", "type" => "VARCHAR(15)", "index" => "index"],

    ["name" => "net_price", "type" => "DECIMAL(10,2)"],
    ["name" => "vat_id", "type" => "INT"],
    ["name" => "gross_price", "type" => "DECIMAL(10,2)"],

    ["name" => "discount_gross_price", "type" => "DECIMAL(10,2)", "null" => true],
    ["name" => "discount_untill", "type" => "DATE", "null" => true],

    ["name" => "stock", "type" => "INT"],

    ["name" => "weight", "type" => "DECIMAL(10,2)"],
    ["name" => "length", "type" => "DECIMAL(10,2)"],
    ["name" => "width", "type" => "DECIMAL(10,2)"],
    ["name" => "height", "type" => "DECIMAL(10,2)"],

    ["name" => "img_url", "type" => "VARCHAR(255)"],
    ["name" => "__img_url", "type" => "VARCHAR(255)"],

    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "__name", "type" => "VARCHAR(255)"],

    ["name" => "__options_json", "type" => "TEXT"],
    ["name" => "__url", "type" => "VARCHAR(255)"],
    ["name" => "compare_sales", "type" => "INT", "index" => "index"],

    ["name" => "__current_gross_price", "type" => "DECIMAL(10,2)", "index" => "index"],
    ["name" => "__discount_percent", "type" => "TINYINT"],
]);
