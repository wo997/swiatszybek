<?php //hook[migration]

DB::createTable("address", [
    ["name" => "address_id", "type" => "INT", "index" => "primary"],
    ["name" => "party", "type" => "VARCHAR(255)"],
    ["name" => "first_name", "type" => "VARCHAR(255)"],
    ["name" => "last_name", "type" => "VARCHAR(255)"],
    ["name" => "company", "type" => "VARCHAR(255)"],
    ["name" => "nip", "type" => "VARCHAR(255)"],
    ["name" => "phone", "type" => "VARCHAR(255)"],
    ["name" => "email", "type" => "VARCHAR(255)"],
    ["name" => "country", "type" => "VARCHAR(255)"],
    ["name" => "post_code", "type" => "VARCHAR(255)"],
    ["name" => "city", "type" => "VARCHAR(255)"],
    ["name" => "street", "type" => "VARCHAR(255)"],
    ["name" => "building_number", "type" => "VARCHAR(255)"],
    ["name" => "flat_number", "type" => "VARCHAR(255)"],
    ["name" => "__display_name", "type" => "VARCHAR(255)"],
    ["name" => "__address_line_1", "type" => "VARCHAR(255)"],
    ["name" => "__address_line_2", "type" => "VARCHAR(255)"],
    ["name" => "__display_address", "type" => "VARCHAR(255)"],
]);
