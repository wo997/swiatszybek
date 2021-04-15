<?php //hook[entity]

EntityManager::register("carrier", [
    "props" => [
        "name" => ["type" => "string"],
        "delivery_type" => ["type" => "delivery_type"],
        "dimensions_json" => ["type" => "string"],
    ],
]);
