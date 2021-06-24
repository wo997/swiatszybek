<?php //hook[migration]

DB::createTable("product_variant", [
    ["name" => "product_variant_id", "type" => "INT", "index" => "primary"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT"],
    ["name" => "common", "type" => "TINYINT(1)", "index" => "index"],
]);
