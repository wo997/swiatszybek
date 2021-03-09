<?php //hook[migration]

DB::createTable("shop_order", [
    ["name" => "shop_order_id", "type" => "INT", "index" => "primary"],
    ["name" => "reference", "type" => "VARCHAR(255)"],
    ["name" => "status_id", "type" => "INT"],
    ["name" => "products_price", "type" => "DECIMAL(10,2)"],
    ["name" => "delivery_price", "type" => "DECIMAL(10,2)"],
    ["name" => "total_price", "type" => "DECIMAL(10,2)"],
    ["name" => "delivery_id", "type" => "INT"],
    ["name" => "rebate_codes", "type" => "VARCHAR(255)"],
]);
