<?php //hook[entity]

EntityManager::register("color", [
    "props" => [
        "name" => ["type" => "string"],
        "pieses" => ["type" => "pies[]"]
    ],
]);

EntityManager::register("pies", [
    "props" => [
        "colors" => ["type" => "color[]"]
    ],
]);

EntityManager::manyToMany("color", "pies");
