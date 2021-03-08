<?php //hook[entity]

EntityManager::register("rebate_code", [
    "props" => [
        "code" => ["type" => "string"],
        "value" => ["type" => "string"],
        "qty" => ["type" => "string"],
        "available_from" => ["type" => "string"],
        "available_till" => ["type" => "string"],
    ],
]);
