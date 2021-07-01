<?php //hook[entity]

EntityManager::register("stock_product", [
    "props" => [
        "product" => ["type" => "product"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "vat_id" => ["type" => "number"],
        "dimension_qty" => ["type" => "number"],
        "shop_order" => ["type" => "shop_order"],
        "delivered_at" => ["type" => "string"],
        // "sold_at" => ["type" => "string"],
        // "returned_at" => ["type" => "string"],
    ],
]);
