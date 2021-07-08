<?php //hook[migration]

DB::createTable(
    "file",
    [
        ["name" => "file_id", "type" => "INT", "index" => "primary"],
        ["name" => "file_path", "type" => "VARCHAR(255)", "index" => "unique"],
        ["name" => "name", "type" => "VARCHAR(255)", "index" => "index"],
        ["name" => "name_counter", "type" => "VARCHAR(255)", "index" => "index"],
        ["name" => "original_file_name", "type" => "VARCHAR(255)"],
        ["name" => "uploaded_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP", "index" => "index"],
        ["name" => "file_type", "type" => "VARCHAR(255)", "index" => "index"],
        ["name" => "user_id", "type" => "INT", "null" => true, "index" => "index"],
    ]
);
