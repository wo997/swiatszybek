<?php //hook[migration]

DB::createTable("user", [
    ["name" => "affiliate_program_code", "type" => "VARCHAR(255)", "null" => true],
]);

DB::createTable("affiliate_program_event", [
    ["name" => "affiliate_program_event_id", "type" => "INT", "index" => "primary"],
    ["name" => "added_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ["name" => "user_id", "type" => "INT"],
    ["name" => "event_name", "type" => "VARCHAR(15)", "index" => "index"],
    ["name" => "event_what_id", "type" => "INT", "null" => true],
]);
