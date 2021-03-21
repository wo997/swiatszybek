<?php //hook[entity]

EntityManager::register("order_status", [
    "props" => [
        "name" => ["type" => "string"],
        "font_clr" => ["type" => "string"],
        "bckg_clr" => ["type" => "string"],
    ],
]);
