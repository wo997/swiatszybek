<?php //hook[entity]

EntityManager::register("transaction_product", [
    "props" => [
        "transaction_id" => ["type" => "number"],
        "product_id" => ["type" => "number"],
        "general_product_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "net_price" => ["type" => "number"],
        "vat" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "discount_gross_price" => ["type" => "number"],
        "current_gross_price" => ["type" => "number"],
        "qty" => ["type" => "number"],
        "total_gross_price" => ["type" => "number"],
        "pos" => ["type" => "number"],
    ],
]);

EntityManager::register("transaction", [
    "props" => [
        "transaction_products" => ["type" => "transaction_product[]"],
    ],
]);

EntityManager::oneToMany("transaction", "transaction_products", "transaction_product", ["parent_required" => true]);
