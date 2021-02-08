<?php //hook[migration]

DB::createTable("product", [
    ["name" => "product_id", "type" => "INT", "index" => "primary"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "net_price", "type" => "DECIMAL(10,2)"],
    ["name" => "gross_price", "type" => "DATETIME", "index" => "DECIMAL(10,2)"],
]);
