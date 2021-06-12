<?php //hook[entity]

EntityManager::register("vat", [
    "props" => [
        "value" => ["type" => "number"],
        "description" => ["type" => "string"],
    ],
]);
