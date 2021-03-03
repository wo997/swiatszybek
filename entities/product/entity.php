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
        "__url" => ["type" => "string"],
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
    $option_ids = [];
    $option_names = [];
    foreach ($options as $option) {
        $option_ids[] = $option->getId();
        $option_names[] = $option->getProp("name");
    }
    $product->setProp("options_json", json_encode($option_ids));

    /** @var Entity GeneralProduct */
    $general_product = $product->getParent();
    $link = getProductLink($general_product->getId(), $option_ids, $general_product->getProp("name"), $option_names);
    $product->setProp("__url", $link);
});
