<?php //hook[entity]

EntityManager::register("product_queue", [
    "props" => [
        "product_id" => ["type" => "number"],
        "email" => ["type" => "string"],
        "submitted_at" => ["type" => "string"],
    ],
]);
