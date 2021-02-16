<?php //hook[entity]

EntityManager::register("product_feature_option", [
    "props" => [
        "product_feature_id" => ["type" => "number"],
        "parent_product_feature_option_id" => ["type" => "number"],
        "name" => ["type" => "string"],
    ],
]);

EntityManager::register("product_feature", [
    "props" => [
        "options" => ["type" => "product_feature_option[]"]
    ],
]);

EntityManager::OneToMany("product_feature", "options", "product_feature_option");
