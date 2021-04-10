<?php //hook[entity]

EntityManager::register("product_variant", [
    "props" => [
        "general_product_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "pos" => ["type" => "number"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "variants" => ["type" => "product_variant[]"]
    ],
]);

EntityManager::oneToMany("general_product", "variants", "product_variant", ["parent_required" => true]);
