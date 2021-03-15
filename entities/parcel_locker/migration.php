<?php //hook[migration]

DB::createTable("parcel_locker", [
    ["name" => "parcel_locker_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "code", "type" => "VARCHAR(255)"],
    ["name" => "country", "type" => "VARCHAR(255)"],
    ["name" => "postal_code", "type" => "VARCHAR(255)"],
    ["name" => "city", "type" => "VARCHAR(255)"],
    ["name" => "street", "type" => "VARCHAR(255)"],
    ["name" => "house_number", "type" => "VARCHAR(255)"],
    ["name" => "apartment_number", "type" => "VARCHAR(255)"],
]);
