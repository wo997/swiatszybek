<?php //hook[entity]

EntityManager::register("payment", [
    "props" => [
        "payment_name" => ["type" => "string"],
        "session_id" => ["type" => "string"],
        "created_at" => ["type" => "string"],
        "shop_order" => ["type" => "shop_order"],
        "payment_status_id" => ["type" => "number"], // 0 or 1?
        "payment_order_id" => ["type" => "string"], // for example p24_order_id
        "paid_at" => ["type" => "string"],
    ],
]);
