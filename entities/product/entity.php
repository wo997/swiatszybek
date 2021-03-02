<?php //hook[entity]

EntityManager::register("product", [
    "props" => [
        "general_product_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "vat_id" => ["type" => "number"],
        "active" => ["type" => "number"],
        "stock" => ["type" => "number"],
        "__img_url" => ["type" => "string"],
        "__name" => ["type" => "string"],
        "options_json" => ["type" => "string"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "products" => ["type" => "product[]"]
    ],
]);

EntityManager::OneToMany("general_product", "products", "product");

EventListener::register("before_save_product_entity", function ($params) {
    /** @var Entity Product */
    $product = $params["obj"];
    /** @var Entity[] ProductFeatureOption */
    $options = $product->getProp("feature_options");
    $options_json = [];
    foreach ($options as $option) {
        $options_json[] = $option->getId();
    }
    $product->setProp("options_json", json_encode($options_json));
});
