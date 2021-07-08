<?php //hook[entity]

EntityManager::register("stock_product", [
    "props" => [
        "product" => ["type" => "product"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "vat" => ["type" => "number"], // been bought with that VAT
        "dimension_qty" => ["type" => "number"],
        "added_at" => ["type" => "string"],
        // "internal_code" => ["type" => "string"], // ugh?
    ],
]);

EntityManager::oneToOne("stock_product", "product", "product");
