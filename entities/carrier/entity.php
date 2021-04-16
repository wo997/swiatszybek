<?php //hook[entity]

EntityManager::register("carrier", [
    "props" => [
        "name" => ["type" => "string"],
        "delivery_type" => ["type" => "delivery_type"],
        "dimensions_json" => ["type" => "string"],
        "tracking_url_prefix" => ["type" => "string"],
        "delivery_time_days" => ["type" => "number"],
        "pos" => ["type" => "number"],
        "active" => ["type" => "number"],
    ],
]);
