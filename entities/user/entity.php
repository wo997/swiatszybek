<?php //hook[entity]

EntityManager::register("user", [
    "props" => [
        "authenticated" => ["type" => "number"],
        "name" => ["type" => "string"],
        "first_name" => ["type" => "string"],
        "last_name" => ["type" => "string"],
        "type" => ["type" => "string"],
        "email" => ["type" => "string"],
        "login" => ["type" => "string"],
        "phone" => ["type" => "string"],
        "password_hash" => ["type" => "string"],
        "remember_me_token" => ["type" => "string"],
        "visited_at" => ["type" => "string"],
        "created_at" => ["type" => "string"],
        "cart_json" => ["type" => "string"],
        "privelege_id" => ["type" => "number"],
        "nickname" => ["type" => "string"],
    ],
]);
