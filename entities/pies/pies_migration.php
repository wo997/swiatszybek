<?php //hook[migration]

DB::createTable("pies", [
    ["name" => "pies_id", "type" => "INT", "index" => "primary"],
    ["name" => "food", "type" => "INT"],
    ["name" => "food_double", "type" => "INT"],
    ["name" => "ate_at", "type" => "DATETIME", "index" => "index"],
    ["name" => "paws_json", "type" => "TEXT"],
]);

// shouldn't be below but does anyone care?
DB::createTable("paw_of_pies", [
    ["name" => "paw_of_pies_id", "previous_name" => "pies_paw_id", "type" => "INT", "index" => "primary"],
    ["name" => "pies_id", "type" => "INT", "index" => "index"],
    ["name" => "name", "type" => "TINYTEXT"],
]);

// many to many relation example below
DB::createTable("color", [
    ["name" => "color_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "TINYTEXT"],
]);

DB::createTable("color_to_pies", [
    ["name" => "color_id", "type" => "INT", "index" => "index"],
    ["name" => "pies_id", "type" => "INT", "index" => "index"],
]);
