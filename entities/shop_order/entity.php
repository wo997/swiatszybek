<?php //hook[entity]

EntityManager::register("shop_order", [
    "props" => [
        "reference" => ["type" => "string"],
    ],
]);
