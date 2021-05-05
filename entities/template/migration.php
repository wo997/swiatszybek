<?php //hook[migration]

DB::createTable(
    "template",
    [
        ["name" => "template_id", "type" => "INT", "index" => "primary", "increment" => true],
        ["name" => "name", "type" => "VARCHAR(255)"],
        ["name" => "v_dom_json", "type" => "MEDIUMTEXT"],
        ["name" => "created_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
        ["name" => "modified_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
        ["name" => "page_type", "type" => "VARCHAR(255)", "index" => "index", "null" => true],
        ["name" => "parent_template_id", "type" => "INT", "index" => "index"],
        ["name" => "pos", "type" => "INT", "index" => "index"],
        //["name" => "v_dom_ids_csv", "type" => "TEXT"],
        ["name" => "max_vid", "type" => "TEXT"],
    ]
);
