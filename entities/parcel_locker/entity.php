<?php //hook[entity]

EntityManager::register("parcel_locker", [
    "props" => [
        "code" => ["type" => "string"],
        "country" => ["type" => "string"],
        "post_code" => ["type" => "string"],
        "city" => ["type" => "string"],
        "street" => ["type" => "string"],
        "building_number" => ["type" => "string"],
        "flat_number" => ["type" => "string"],
    ],
]);
