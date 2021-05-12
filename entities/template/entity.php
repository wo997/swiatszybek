<?php //hook[entity]

EntityManager::register("template", [
    "props" => [
        "name" => ["type" => "string"],
        "is_global" => ["type" => "number"],
        "page_type" => ["type" => "string"],
        "v_dom_json" => ["type" => "string"],
        "version" => ["type" => "string"],
        "created_at" => ["type" => "string"],
        "modified_at" => ["type" => "string"],
        "parent_template_id" => ["type" => "number"],
        "pos" => ["type" => "number"],
        //"v_dom_ids_csv" => ["type" => "string"],
        "max_vid" => ["type" => "string"],
        "used_modules_csv" => ["type" => "string"],
    ],
]);

EventListener::register("before_save_template_entity", function ($params) {
    updatePageableMetadata("template", $params["obj"]->getId());
});
