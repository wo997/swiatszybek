<?php //hook[migration]

DB::createTable("product_queue", [
    ["name" => "product_queue_id", "type" => "INT", "index" => "primary"],
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "email", "type" => "VARCHAR(255)", "index" => "index"],
    ["name" => "submitted_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ["name" => "email_sent_at", "type" => "DATETIME", "null" => true],
]);

DB::createTable("product", [
    ["name" => "__queue_count", "type" => "INT", "index" => "index"],
]);
