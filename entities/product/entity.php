<?php //hook[entity]

EntityManager::register("product", [
    "props" => [
        "general_product_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "vat_id" => ["type" => "number"],
        "active" => ["type" => "number"],
        "stock" => ["type" => "number"],
        "__img_url" => ["type" => "string"],
        "__full_name" => ["type" => "string"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "products" => ["type" => "product[]"]
    ],
]);

EntityManager::OneToMany("general_product", "products", "product");
