<?php //hook[entity]

EntityManager::register("parcel_locker", [
    "props" => [
        "code" => ["type" => "string"],
        "country" => ["type" => "string"],
        "postal_code" => ["type" => "string"],
        "city" => ["type" => "string"],
        "street" => ["type" => "string"],
        "house_number" => ["type" => "string"],
        "apartment_number" => ["type" => "string"],
    ],
]);
