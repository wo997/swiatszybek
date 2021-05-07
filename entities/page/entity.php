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
        "url" => ["type" => "string"],
        "page_type" => ["type" => "string"],
        "link_what_id" => ["type" => "number"],
        "template_id" => ["type" => "number"],
        //"v_dom_ids_csv" => ["type" => "string"],
        "max_vid" => ["type" => "string"],
        "used_modules_csv" => ["type" => "string"],
    ],
]);

EventListener::register("before_save_page_entity", function ($params) {
    updatePageableMetadata("page", $params["obj"]->getId());
});
