<?php //hook[entity]

EntityManager::register("product", [
    "props" => [
        "general_product_id" => ["type" => "number"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "vat_id" => ["type" => "number"],
        "active" => ["type" => "number"],
        "stock" => ["type" => "number"],
        "__img_url" => ["type" => "string"],
        "__name" => ["type" => "string"],
        "__options_json" => ["type" => "string"],
        "__url" => ["type" => "string"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "products" => ["type" => "product[]"]
    ],
]);

EntityManager::oneToMany("general_product", "products", "product", ["parent_required" => true]);

EventListener::register("before_save_product_entity", function ($params) {
    /** @var Entity Product */
    $product = $params["obj"];
    /** @var Entity[] ProductFeatureOption */
    $feature_options = $product->getProp("feature_options");
    $options = [];
    foreach ($feature_options as $feature_option) {
        $option_id = $feature_option->getId();

        /** @var Entity ProductFeature */
        $feature = $feature_option->getParent("product_feature");
        if (!$feature) {
            continue;
        }
        $feature_id = $feature->getId();

        if (!isset($options[$feature_id])) {
            $options[$feature_id] = [];
        }
        if (!in_array($option_id, $options[$feature_id])) {
            $options[$feature_id][] = $option_id;
        }
    }
    $product->setProp("__options_json", $options ? json_encode($options) : "{}");
});

EventListener::register("set_product_entity_stock", function ($params) {
    $val = $params["val"];
    if ($val < 0) {
        return 0;
    }
});
