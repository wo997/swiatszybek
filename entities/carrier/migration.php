<?php //hook[migration]

DB::createTable("carrier", [
    ["name" => "carrier_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "delivery_type_id", "type" => "VARCHAR(255)", "index" => "index"],
    ["name" => "dimensions_json", "type" => "TEXT"],
]);
