<?php //hook[migration]

DB::createTable("address", [
    ["name" => "address_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "party", "type" => "VARCHAR(255)"],
    ["name" => "first_name", "type" => "VARCHAR(255)"],
    ["name" => "last_name", "type" => "VARCHAR(255)"],
    ["name" => "company", "type" => "VARCHAR(255)"],
    ["name" => "nip", "type" => "VARCHAR(255)"],
    ["name" => "phone", "type" => "VARCHAR(255)"],
    ["name" => "email", "type" => "VARCHAR(255)"],
    ["name" => "country", "type" => "VARCHAR(255)"],
    ["name" => "postal_code", "type" => "VARCHAR(255)"],
    ["name" => "city", "type" => "VARCHAR(255)"],
    ["name" => "street", "type" => "VARCHAR(255)"],
    ["name" => "house_number", "type" => "VARCHAR(255)"],
    ["name" => "apartment_number", "type" => "VARCHAR(255)"],
]);
