<?php //hook[migration]

DB::createTable("stock_product", [
    ["name" => "stock_product_id", "type" => "INT", "index" => "primary"],
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "net_price", "type" => "DECIMAL(10,2)"],
    ["name" => "gross_price", "type" => "DECIMAL(10,2)", "index" => "index"],
    ["name" => "vat_id", "type" => "INT"],
    ["name" => "shop_order_id", "type" => "INT", "index" => "index"],
    ["name" => "delivered_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
]);
