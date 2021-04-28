<?php //hook[migration]

DB::createTable(
    "page",
    [
        ["name" => "page_id", "type" => "INT", "index" => "primary", "increment" => true],
        ["name" => "seo_title", "type" => "VARCHAR(255)"],
        ["name" => "seo_description", "type" => "VARCHAR(255)"],
        ["name" => "v_dom_json", "type" => "MEDIUMTEXT"],
        ["name" => "version", "type" => "INT"],
        ["name" => "created_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
        ["name" => "modified_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ]
);
