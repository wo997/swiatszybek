<?php //hook[migration]

DB::createTable("rebate_code", [
    ["name" => "rebate_code_id", "type" => "INT", "index" => "primary"],
    ["name" => "code", "type" => "VARCHAR(255)"],
    ["name" => "value", "type" => "VARCHAR(255)"],
    ["name" => "qty", "type" => "INT"],
    ["name" => "available_from", "type" => "DATE", "null" => true],
    ["name" => "available_till", "type" => "DATE", "null" => true],
    ["name" => "general_products_json", "type" => "TEXT"],
    ["name" => "users_json", "type" => "TEXT"],
]);
