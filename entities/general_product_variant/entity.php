<?php //hook[entity]

EntityManager::register("general_product_variant", [
    "props" => [
        "general_product_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "pos" => ["type" => "number"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "variants" => ["type" => "general_product_variant[]"]
    ],
]);
