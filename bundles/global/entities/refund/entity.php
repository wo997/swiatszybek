<?php //hook[entity]

EntityManager::register("refund", [
    "props" => [
        "payment_id" => ["type" => "string"],
        "requestId" => ["type" => "string"],
        "refundsUuid" => ["type" => "string"],
        "refunded_at" => ["type" => "string"],
    ],
]);
