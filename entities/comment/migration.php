<?php //hook[migration]

DB::createTable("comment", [
    ["name" => "comment_id", "type" => "INT", "index" => "primary"],
    ["name" => "comment", "type" => "TEXT"],
    ["name" => "rating", "type" => "VARCHAR(255)"],
    ["name" => "general_product_id", "type" => "VARCHAR(255)"],
    ["name" => "options_csv", "previous_name" => "options_json", "type" => "VARCHAR(255)"],
    ["name" => "user_id", "type" => "INT", "index" => "index"],
    ["name" => "created_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
]);
