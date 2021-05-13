<?php //hook[migration]

DB::createTable("aaa", [
    ["name" => "aaa_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT"],
]);
