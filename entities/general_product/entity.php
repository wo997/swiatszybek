<?php //hook[entity]

EntityManager::register("general_product", [
    "props" => [
        "name" => ["type" => "string"],
        "main_img_url" => ["type" => "string"],
    ],
]);
