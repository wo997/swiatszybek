<?php //hook[migration]

DB::createTable(
    "template",
    [
        ["name" => "template_id", "type" => "INT", "index" => "primary"],
        ["name" => "name", "type" => "VARCHAR(255)"],
        ["name" => "v_dom_json", "type" => "MEDIUMTEXT"],
        ["name" => "version", "type" => "INT"],
        ["name" => "created_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
        ["name" => "modified_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
        ["name" => "page_type", "type" => "VARCHAR(255)", "index" => "index", "null" => true],
        ["name" => "parent_template_id", "type" => "INT", "index" => "index"],
        ["name" => "pos", "type" => "INT", "index" => "index"],
        //["name" => "v_dom_ids_csv", "type" => "TEXT"],
        ["name" => "max_vid", "type" => "INT"],
        ["name" => "used_modules_csv", "type" => "TEXT"],
        ["name" => "is_global", "type" => "TINYINT(1)"],
        ["name" => "custom_css", "type" => "TEXT"],
        ["name" => "custom_js", "type" => "TEXT"],
        ["name" => "custom_header", "type" => "TEXT"],
        ["name" => "custom_footer", "type" => "TEXT"],
    ]
);
