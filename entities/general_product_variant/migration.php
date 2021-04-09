<?php //hook[migration]

DB::createTable("general_product_variant", [
    ["name" => "general_product_variant_id", "type" => "INT", "index" => "primary"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);
