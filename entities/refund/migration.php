<?php //hook[migration]

DB::createTable("refund", [
    ["name" => "refund_id", "type" => "INT", "index" => "primary"],
    ["name" => "payment_id", "type" => "INT", "index" => "index"],
    ["name" => "price", "type" => "DECIMAL(10,2)", "index" => "index"],
    ["name" => "refunded_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ["name" => "requestId", "type" => "VARCHAR(255)", "null" => true],
    ["name" => "refundsUuid", "type" => "VARCHAR(255)", "null" => true],
]);
