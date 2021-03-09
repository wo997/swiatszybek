<?php //hook[migration]

DB::createTable("ordered_product", [
    ["name" => "ordered_product_id", "type" => "INT", "index" => "primary"],
    ["name" => "shop_order_id", "type" => "INT", "index" => "index"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "qty", "type" => "VARCHAR(255)"],
    ["name" => "net_price", "type" => "DECIMAL(10,2)"],
    ["name" => "gross_price", "type" => "DECIMAL(10,2)"],
    ["name" => "img_url", "type" => "VARCHAR(255)"],
    ["name" => "url", "type" => "VARCHAR(255)"],
]);
