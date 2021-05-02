<?php //hook[entity]

EntityManager::register("template", [
    "props" => [
        "name" => ["type" => "string"],
        "page_type" => ["type" => "string"],
        "v_dom_json" => ["type" => "string"],
        "created_at" => ["type" => "string"],
        "modified_at" => ["type" => "string"],
        "parent_template_id" => ["type" => "number"],
        "pos" => ["type" => "number"],
    ],
]);
