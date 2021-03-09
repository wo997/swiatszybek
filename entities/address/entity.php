<?php //hook[entity]

EntityManager::register("address", [
    "props" => [
        "party" => ["type" => "string"],
        "first_name" => ["type" => "string"],
        "last_name" => ["type" => "string"],
        "company" => ["type" => "string"],
        "nip" => ["type" => "string"],
        "phone" => ["type" => "string"],
        "email" => ["type" => "string"],
        "country" => ["type" => "string"],
        "postal_code" => ["type" => "string"],
        "city" => ["type" => "string"],
        "street" => ["type" => "string"],
        "house_number" => ["type" => "string"],
        "apartment_number" => ["type" => "string"],
    ],
]);
