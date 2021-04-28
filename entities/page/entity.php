<?php //hook[entity]

EntityManager::register("page", [
    "props" => [
        "seo_title" => ["type" => "string"],
        "seo_description" => ["type" => "string"],
        "v_dom_json" => ["type" => "string"],
        "version" => ["type" => "string"],
        "created_at" => ["type" => "string"],
        "modified_at" => ["type" => "string"],
    ],
]);
