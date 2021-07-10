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
        "default_seo_description" => ["type" => "string"],
        "custom_css" => ["type" => "string"],
        "custom_js" => ["type" => "string"],
        "custom_header" => ["type" => "string"],
        "custom_footer" => ["type" => "string"],
    ],
]);

EventListener::register("set_page_entity_active", function ($params) {
    /** @var Entity Page  */
    $page = $params["obj"];
    $active = $params["val"];

    if ($page->ready) {
        if ($page->getProp("page_type") === "general_product") {
            $general_product_id = $page->getProp("link_what_id");
            $general_product = EntityManager::getEntityById("general_product", $general_product_id);
            if ($general_product && $general_product->getProp("active") != $active) {
                $general_product->setProp("active", $active, true);
            }
        }
    }
});

EventListener::register("set_general_product_entity_active", function ($params) {
    /** @var Entity GeneralProduct  */
    $general_product = $params["obj"];
    $active = $params["val"];
    $general_product_id = $general_product->getId();

    if ($general_product->ready) {
        $page_id = DB::fetchVal("SELECT page_id FROM page WHERE link_what_id = $general_product_id AND page_type='general_product'");
        if ($page_id) {
            $page = EntityManager::getEntityById("page", $page_id);
            if ($page && $page->getProp("active") != $active) {
                $page->setProp("active", $active, true);
            }
        }
    }
});

EventListener::register("before_save_page_entity", function ($params) {
    $page_id = $params["obj"]->getId();
    updatePageableMetadata("page", $page_id);
    updatePageDefaultSeoDescription($page_id);
});
