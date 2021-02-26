<?php //hook[entity]

EntityManager::register("file", [
    "props" => [
        "file_path" => ["type" => "string"],
        "default_file_name" => ["type" => "string"],
        "uploaded_at" => ["type" => "string"],
        "file_type" => ["type" => "string"],
        "user_id" => ["type" => "number"],
    ],
]);
