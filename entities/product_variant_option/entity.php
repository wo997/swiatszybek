<?php //hook[entity]

EntityManager::register("product_variant_option", [
    "props" => [
        "product_variant_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "pos" => ["type" => "number"],
        "product_feature_options" => ["type" => "product_feature_option[]"],
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
