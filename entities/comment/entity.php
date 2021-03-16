<?php //hook[entity]

EntityManager::register("comment", [
    "props" => [
        "comment" => ["type" => "string"],
        "rating" => ["type" => "number"],
        "general_product_id" => ["type" => "number"],
        "options" => ["type" => "product_feature_option[]"],
        "user" => ["type" => "user"],
        "created_at" => ["type" => "string"],
    ],
]);

EntityManager::manyToMany("comment", "product_feature_option", "comment_to_product_feature_option");
