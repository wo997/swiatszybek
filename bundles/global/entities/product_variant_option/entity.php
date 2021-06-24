<?php //hook[entity]

EntityManager::register("product_variant_option", [
    "props" => [
        "product_variant_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "pos" => ["type" => "number"],
        "product_feature_options" => ["type" => "product_feature_option[]"],
        "__feature_options_json" => ["type" => "string"],
    ]
]);
EntityManager::manyToMany("product_variant_option", "product_feature_option", "product_variant_option_to_feature_option");

EntityManager::register("product_variant", [
    "props" => [
        "options" => ["type" => "product_variant_option[]"]
    ],
]);
EntityManager::oneToMany("product_variant", "options", "product_variant_option", ["parent_required" => true]);

EntityManager::register("product", [
    "props" => [
        "variant_options" => ["type" => "product_variant_option[]"]
    ],
]);
EntityManager::manyToMany("product", "product_variant_option", "product_to_variant_option");


EventListener::register("before_save_product_variant_option_entity", function ($params) {
    /** @var Entity ProductVariantOption */
    $product_variant_option = $params["obj"];
    /** @var Entity[] ProductFeatureOption */
    $feature_options = $product_variant_option->getProp("product_feature_options");
    $options = [];
    foreach ($feature_options as $feature_option) {
        $option_id = $feature_option->getId();
        if (!in_array($option_id, $options)) {
            $options[] = $option_id;
        }
    }
    $product_variant_option->setProp("__feature_options_json", json_encode($options));
});
