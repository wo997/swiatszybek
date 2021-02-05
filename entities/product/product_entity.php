<?php //hook[entity]

EntityManager::register("product", [
    "props" => [
        "name" => ["type" => "string"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
    ],
]);
