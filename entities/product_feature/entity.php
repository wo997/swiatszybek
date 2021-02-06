<?php //hook[entity]

EntityManager::register("product_feature", [
    "props" => [
        "product_feature_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "products" => ["type" => "product[]"]
    ],
]);

EntityManager::register("product", [
    "props" => [
        "features" => ["type" => "product_feature[]"]
    ],
]);

EntityManager::manyToMany("product", "product_feature", "product_to_feature");
