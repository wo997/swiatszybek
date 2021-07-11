<?php //hook[entity]

EntityManager::register("user", [
    "props" => [
        "affiliate_program_code" => ["type" => "string"],
    ],
]);

EntityManager::register("affiliate_program_event", [
    "props" => [
        "user_id" => ["type" => "number"],
        "event_name" => ["type" => "string"],
        "event_what_id" => ["type" => "number"],
        "added_at" => ["type" => "number"],
    ],
]);
