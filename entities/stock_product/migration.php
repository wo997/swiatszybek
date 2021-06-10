<?php //hook[migration]

DB::createTable("stock_product", [
    ["name" => "product_id", "type" => "INT", "index" => "primary"],
    ["name" => "net_price", "type" => "DECIMAL(10,2)"],
    ["name" => "gross_price", "type" => "DECIMAL(10,2)", "index" => "index"],
    ["name" => "vat_id", "type" => "INT"],
    ["name" => "shop_order_id", "type" => "INT", "index" => "index"],
    ["name" => "delivered_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
]);
