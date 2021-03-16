<?php //hook[entity]

EntityManager::register("comment", [
    "props" => [
        "content" => ["type" => "string"],
        "rating" => ["type" => "number"],
        "general_product_id" => ["type" => "number"],
        "options_json" => ["type" => "number"],
        "user" => ["type" => "user"],
        "created_at" => ["type" => "string"],
    ],
]);
