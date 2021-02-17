<?php //hook[entity]

EntityManager::register("product_feature", [
    "props" => [
        "product_feature_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "products" => ["type" => "product[]"],
        "pos" => ["type" => "number"],
    ],
    //"sortable" => "pos",
]);

EntityManager::register("product", [
    "props" => [
        "features" => ["type" => "product_feature[]"]
    ],
]);

EntityManager::manyToMany("product", "product_feature", "product_to_feature");

EntityManager::register("general_product", [
    "props" => [
        "features" => ["type" => "general_product_feature[]"]
    ],
]);

EntityManager::manyToMany("general_product", "product_feature", "general_product_to_feature");
