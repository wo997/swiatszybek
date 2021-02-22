<?php //hook[entity]

EntityManager::register("product_category", [
    "props" => [
        "product_category_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "pos" => ["type" => "number"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "categories" => ["type" => "product_category[]"]
    ],
]);

EntityManager::manyToMany("general_product", "product_category", "general_product_to_category");
