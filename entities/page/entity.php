<?php //hook[entity]

EntityManager::register("page", [
    "props" => [
        "seo_title" => ["type" => "string"],
        "seo_description" => ["type" => "string"],
        "content" => ["type" => "string"],
        "version" => ["type" => "string"],
        "created_at" => ["type" => "string"],
        "modified_at" => ["type" => "string"],
    ],
]);
