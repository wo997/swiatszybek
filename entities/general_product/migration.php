<?php //hook[migration]

DB::createTable("general_product", [
    ["name" => "general_product_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
]);
