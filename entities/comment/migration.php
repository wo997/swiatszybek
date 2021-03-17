<?php //hook[migration]

DB::createTable("comment", [
    ["name" => "comment_id", "type" => "INT", "index" => "primary"],
    ["name" => "comment", "type" => "TEXT"],
    ["name" => "rating", "type" => "VARCHAR(255)"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "user_id", "type" => "INT", "index" => "index"],
    ["name" => "created_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
]);

DB::createTable("comment_to_product_feature_option", [
    ["name" => "comment_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "index"],
]);
