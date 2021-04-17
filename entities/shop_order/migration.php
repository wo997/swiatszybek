<?php //hook[migration]

DB::createTable("shop_order", [
    ["name" => "shop_order_id", "type" => "INT", "index" => "primary"],
    ["name" => "reference", "type" => "VARCHAR(255)"],
    ["name" => "__url", "type" => "VARCHAR(255)"],
    ["name" => "status_id", "type" => "INT", "index" => "index"],
    ["name" => "delivery_type_id", "type" => "INT", "index" => "index"],
    ["name" => "carrier_id", "type" => "INT", "index" => "index"],
    ["name" => "package_api_key", "type" => "VARCHAR(16)", "index" => "index"],
    ["name" => "payment_time", "type" => "VARCHAR(16)", "index" => "index"],
    ["name" => "products_price", "type" => "DECIMAL(10,2)"],
    ["name" => "delivery_price", "type" => "DECIMAL(10,2)"],
    ["name" => "total_price", "type" => "DECIMAL(10,2)"],
    ["name" => "user_id", "type" => "INT", "index" => "index"],
    ["name" => "rebate_codes", "type" => "VARCHAR(255)"],
    ["name" => "main_address_id", "type" => "INT", "null" => true],
    ["name" => "courier_address_id", "type" => "INT", "null" => true, "index" => "index"],
    ["name" => "parcel_locker_id", "type" => "INT", "null" => true, "index" => "index"],
    ["name" => "ordered_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ["name" => "paid_at", "type" => "DATETIME", "null" => true],
]);
