<?php //hook[entity]

EntityManager::register("delivery_type", [
    "props" => [
        "name" => ["type" => "string"],
        "key" => ["type" => "string"],
    ],
]);
