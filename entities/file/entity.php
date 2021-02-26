<?php //hook[entity]

EntityManager::register("file", [
    "props" => [
        "name" => ["type" => "string"],
        "file_path" => ["type" => "string"],
        "default_file_name" => ["type" => "string"],
        "uploaded_at" => ["type" => "string"],
        "file_type" => ["type" => "string"],
        "user_id" => ["type" => "number"],
        "main_img_url" => ["type" => "string"],
    ],
]);
