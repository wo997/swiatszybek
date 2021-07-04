<?php //hook[migration]

DB::createTable("transaction", [
    ["name" => "transaction_id", "type" => "INT", "index" => "primary"],
    ["name" => "buyer_id", "type" => "INT", "index" => "index"],
    ["name" => "seller_id", "type" => "INT", "index" => "index"],
    ["name" => "is_expense", "type" => "TINYINT(1)", "index" => "index"],
    ["name" => "created_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ["name" => "paid_at", "type" => "DATETIME", "null" => true],
    ["name" => "net_price", "type" => "DECIMAL(10,2)"],
    ["name" => "gross_price", "type" => "DECIMAL(10,2)"],
]);
