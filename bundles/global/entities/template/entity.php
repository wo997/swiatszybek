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
        "custom_css" => ["type" => "string"],
        "custom_js" => ["type" => "string"],
        "custom_header" => ["type" => "string"],
        "custom_footer" => ["type" => "string"],
    ],
]);

EventListener::register("set_template_entity_is_global", function ($params) {
    /** @var Entity Template  */
    $template = $params["obj"];
    $template_id = $template->getId();
    $val = $params["val"];

    if ($template->ready && $val) {
        $other_global_template_id = DB::fetchVal("SELECT template_id FROM template WHERE is_global AND template_id <> $template_id");
        if ($other_global_template_id) {
            $other_global_template = EntityManager::getEntityById("template", $other_global_template_id);
            if ($other_global_template) {
                $other_global_template->setProp("is_global", 0);
            }
        }
    }
});


EventListener::register("before_save_template_entity", function ($params) {
    updatePageableMetadata("template", $params["obj"]->getId());
});
