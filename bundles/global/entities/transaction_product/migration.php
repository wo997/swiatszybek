<?php //hook[migration]

DB::createTable("transaction_product", [
    ["name" => "transaction_product_id", "type" => "INT", "index" => "primary"],
    ["name" => "transaction_id", "type" => "INT", "index" => "index"],
    ["name" => "product_id", "type" => "INT", "null" => true],
    ["name" => "general_product_id", "type" => "INT", "null" => true],
    ["name" => "name", "type" => "VARCHAR(256)"],
    ["name" => "net_price", "type" => "DECIMAL(10,2)"],
    ["name" => "vat", "type" => "DECIMAL(10,2)"],
    ["name" => "gross_price", "type" => "DECIMAL(10,2)"],
    ["name" => "current_gross_price", "type" => "DECIMAL(10,2)"],
    ["name" => "qty", "type" => "INT"],
    ["name" => "total_gross_price", "type" => "INT"],
]);
