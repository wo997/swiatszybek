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

EntityManager::register("general_product", [
    "props" => [
        "comments" => ["type" => "comment[]"],
        "__avg_rating" => ["type" => "number"],
        "__rating_count" => ["type" => "number"],
    ],
]);

EntityManager::manyToMany("comment", "product_feature_option", "comment_to_product_feature_option");

EntityManager::oneToMany("general_product", "comments", "comment");
