<?php //hook[migration]

DB::createTable("product_feature", [
    ["name" => "product_feature_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
    ["name" => "data_type", "type" => "VARCHAR(255)"],
    ["name" => "physical_measure", "type" => "VARCHAR(255)"],
    ["name" => "list_type", "type" => "VARCHAR(255)"],
    ["name" => "extra", "type" => "VARCHAR(255)"],
    ["name" => "units_json", "type" => "TEXT"],
]);

DB::createTable("general_product_to_feature", [
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_id", "type" => "INT", "index" => "index"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);
