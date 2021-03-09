<?php //hook[entity]

EntityManager::register("ordered_product", [
    "props" => [
        "shop_order_id" => ["type" => "number"],
        "general_product_id" => ["type" => "number"],
        "product_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "qty" => ["type" => "number"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "img_url" => ["type" => "string"],
        "url" => ["type" => "string"],
    ],
]);
