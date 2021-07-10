<?php //hook[migration]

DB::createTable(
    "page",
    [
        ["name" => "page_id", "type" => "INT", "index" => "primary"],
        ["name" => "seo_title", "type" => "VARCHAR(255)"],
        ["name" => "seo_description", "type" => "VARCHAR(255)"],
        ["name" => "v_dom_json", "type" => "MEDIUMTEXT"],
        ["name" => "active", "type" => "TINYINT(1)"],
        ["name" => "version", "type" => "INT"],
        ["name" => "created_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
        ["name" => "modified_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
        ["name" => "url", "type" => "VARCHAR(255)", "index" => "index", "null" => true],
        ["name" => "page_type", "type" => "VARCHAR(255)", "index" => "index", "null" => true],
        ["name" => "link_what_id", "type" => "INT", "index" => "index", "null" => true],
        ["name" => "template_id", "type" => "INT", "index" => "index"],
        //["name" => "v_dom_ids_csv", "type" => "TEXT"],
        ["name" => "max_vid", "type" => "INT"],
        ["name" => "used_modules_csv", "type" => "TEXT"],
        ["name" => "default_seo_description", "type" => "VARCHAR(255)"],
        ["name" => "custom_css", "type" => "TEXT"],
        ["name" => "custom_js", "type" => "TEXT"],
        ["name" => "custom_header", "type" => "TEXT"],
        ["name" => "custom_footer", "type" => "TEXT"],
    ]
);
