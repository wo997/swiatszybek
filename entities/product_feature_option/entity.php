<?php //hook[entity]

EntityManager::register("product_feature_option", [
    "props" => [
        "product_feature_id" => ["type" => "number"],
        "parent_product_feature_option_id" => ["type" => "number"],
        "value" => ["type" => "string"],
        "float_value" => ["type" => "number"],
        "datetime_value" => ["type" => "string"],
        "text_value" => ["type" => "string"],
    ],
]);

EntityManager::register("product_feature", [
    "props" => [
        "options" => ["type" => "product_feature_option[]"]
    ],
]);

EntityManager::OneToMany("product_feature", "options", "product_feature_option");

EntityManager::register("product", [
    "props" => [
        "feature_options" => ["type" => "product_feature_option[]"]
    ],
]);

EntityManager::manyToMany("product", "product_feature_option", "product_to_feature_option");

EntityManager::register("general_product", [
    "props" => [
        "feature_options" => ["type" => "product_feature_option[]"]
    ],
]);

EntityManager::manyToMany(
    "general_product",
    "product_feature_option",
    "general_product_to_feature_option",
    [
        "meta" => [
            "pos" => ["type" => "number"],
        ]
    ]
);
