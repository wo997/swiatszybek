<?php //hook[entity]

EntityManager::register("transaction_product", [
    "props" => [
        "product_id" => ["type" => "number"],
        "general_product_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "net_price" => ["type" => "number"],
        "vat" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "current_gross_price" => ["type" => "number"],
        "qty" => ["type" => "number"],
        "total_gross_price" => ["type" => "number"],
    ],
]);
