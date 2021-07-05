<?php //hook[entity]

EntityManager::register("transaction", [
    "props" => [
        "buyer" => ["type" => "address"],
        "seller" => ["type" => "address"],
        "is_expense" => ["type" => "number"],
        "created_at" => ["type" => "string"],
        "paid_at" => ["type" => "string"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "transaction_products" => ["type" => "transaction_products"],
        "__products_json" => ["type" => "string"],
        "__products_search" => ["type" => "string"],
        "__search" => ["type" => "string"],
    ],
]);

EntityManager::oneToOne("transaction", "buyer", "address");

EntityManager::oneToOne("transaction", "seller", "address");

EntityManager::oneToMany("transaction", "transaction_products", "transaction_product");
