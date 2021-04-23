<?php //hook[entity]

EntityManager::register("menu", [
    "props" => [
        "menu_id" => ["type" => "number"],
        "parent_menu_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "pos" => ["type" => "number"],
        "url" => ["type" => "number"],
        "link_what" => ["type" => "string"],
        "link_what_id" => ["type" => "number"],
    ],
]);
