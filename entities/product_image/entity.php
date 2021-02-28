<?php //hook[entity]

EntityManager::register("product_image", [
    "props" => [
        "img_url" => ["type" => "string"],
        "general_product_id" => ["type" => "number"],
        "pos" => ["type" => "number"],
        "product_feature_options" => ["type" => "product_feature_option[]"],
        "options_json" => ["type" => "string"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "images" => ["type" => "product_image[]"]
    ],
]);

EntityManager::OneToMany(
    "general_product",
    "images",
    "product_image",
);

EntityManager::manyToMany("product_image", "product_feature_option", "product_image_to_feature_option");

EventListener::register("save_product_image_entity", function ($params) {
    /** @var Entity */
    $product_image = $params["obj"];
    /** @var Entity[] */
    $options = $product_image->getProp("product_feature_options");
    $options_json = [];
    foreach ($options as $option) {
        if (!$option->willExistForOtherEntity($product_image->getGlobalId())) {
            continue;
        }
        $options_json[] = $option->getId();
    }
    $product_image->setProp("options_json", json_encode($options_json));
});
