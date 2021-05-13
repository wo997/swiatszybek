<?php //hook[migration]

DB::createTable("payment", [
    ["name" => "payment_id", "type" => "INT", "index" => "primary"],
    ["name" => "payment_name", "type" => "VARCHAR(255)"],
    ["name" => "session_id", "type" => "VARCHAR(255)", "null" => true],
    ["name" => "created_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ["name" => "shop_order_id", "type" => "INT", "index" => "index"],
    ["name" => "payment_status_id", "type" => "INT"],
    ["name" => "paid_at", "type" => "DATETIME", "null" => true],
    ["name" => "payment_order_id", "type" => "VARCHAR(255)"],
]);
