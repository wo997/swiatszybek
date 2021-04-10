<?php //hook[entity]

EntityManager::register("general_product_variant_option", [
    "props" => [
        "general_product_variant_id" => ["type" => "number"],
        "value" => ["type" => "string"],
    ]
]);

EntityManager::register("general_product_variant", [
    "props" => [
        "options" => ["type" => "general_product_variant_option[]"]
    ],
]);

EntityManager::oneToMany("general_product_variant", "options", "general_product_variant_option", ["parent_required" => true]);

EntityManager::register("general_product", [
    "props" => [
        "variant_options" => ["type" => "general_product_variant_option[]"]
    ],
]);

EntityManager::oneToMany("general_product", "variant_options", "general_product_variant_option");

EntityManager::register("product", [
    "props" => [
        "variant_options" => ["type" => "general_product_variant_option[]"]
    ],
]);

EntityManager::manyToMany("product", "general_product_variant_option", "product_to_general_product_variant_option");
