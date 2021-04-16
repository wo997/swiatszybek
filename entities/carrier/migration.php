<?php //hook[migration]

DB::createTable("carrier", [
    ["name" => "carrier_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "delivery_type_id", "type" => "INT", "index" => "index"],
    ["name" => "dimensions_json", "type" => "TEXT"],
    ["name" => "tracking_url_prefix", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT"],
    ["name" => "delivery_time_days", "type" => "INT"],
]);
