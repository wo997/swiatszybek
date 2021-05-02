<?php //hook[entity]

EntityManager::register("page", [
    "props" => [
        "seo_title" => ["type" => "string"],
        "seo_description" => ["type" => "string"],
        "v_dom_json" => ["type" => "string"],
        "active" => ["type" => "number"],
        "version" => ["type" => "string"],
        "created_at" => ["type" => "string"],
        "modified_at" => ["type" => "string"],
        "template_name" => ["type" => "string"],
        "url" => ["type" => "string"],
        "page_type" => ["type" => "string"],
        "link_what_id" => ["type" => "number"],
        "parent_page_id" => ["type" => "number"],
    ],
]);
