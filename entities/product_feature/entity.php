<?php //hook[entity]

EntityManager::register("product_feature", [
    "props" => [
        "product_feature_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "products" => ["type" => "product[]"],
        "pos" => ["type" => "number"],
        "data_type" => ["type" => "string"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "features" => ["type" => "product_feature[]"]
    ],
]);

EntityManager::manyToMany(
    "general_product",
    "product_feature",
    "general_product_to_feature",
    [
        "meta" => [
            "pos" => ["type" => "number"],
        ]
    ]
);
