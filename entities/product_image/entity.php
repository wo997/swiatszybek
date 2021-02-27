<?php //hook[entity]

EntityManager::register("product_image", [
    "props" => [
        "img_url" => ["type" => "string"],
        "general_product_id" => ["type" => "number"],
        "pos" => ["type" => "number"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "images" => ["type" => "product_image[]"]
    ],
]);

EntityManager::OneToMany(
    "general_product",
    "images",
    "product_image",
);
