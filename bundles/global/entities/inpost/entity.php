<?php //hook[entity]

EntityManager::register("shop_order", [
    "props" => [
        "inpost_shipment_id" => ["type" => "number"],
    ],
]);
