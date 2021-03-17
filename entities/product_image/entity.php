<?php //hook[entity]

EntityManager::register("product_img", [
    "props" => [
        "img_url" => ["type" => "string"],
        "general_product_id" => ["type" => "number"],
        "pos" => ["type" => "number"],
        "product_feature_options" => ["type" => "product_feature_option[]"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "images" => ["type" => "product_img[]"]
    ],
]);

EntityManager::oneToMany("general_product", "images", "product_img", ["parent_required" => true]);

EntityManager::manyToMany("product_img", "product_feature_option", "product_img_to_feature_option");
