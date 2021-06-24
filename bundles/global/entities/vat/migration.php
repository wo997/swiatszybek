<?php //hook[migration]

DB::createTable("vat", [
    ["name" => "vat_id", "type" => "INT", "index" => "primary"],
    ["name" => "value", "type" => "DECIMAL(10,2)"],
    ["name" => "description", "type" => "VARCHAR(255)"],
]);
