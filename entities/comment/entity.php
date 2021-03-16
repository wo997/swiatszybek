<?php //hook[entity]

EntityManager::register("comment", [
    "props" => [
        "comment" => ["type" => "string"],
        "rating" => ["type" => "number"],
        "general_product_id" => ["type" => "number"],
        "options_csv" => ["type" => "string"],
        "user" => ["type" => "user"],
        "created_at" => ["type" => "string"],
    ],
]);
