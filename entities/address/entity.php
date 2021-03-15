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
        "__display_name" => ["type" => "string"],
    ],
]);


EventListener::register("before_save_address_entity", function ($params) {
    /** @var Entity Address */
    $address = $params["obj"];

    $display_name = "";

    if ($address->getProp("party") === "company") {
        $display_name = $address->getProp("company");
    } else {
        $display_name = $address->getProp("first_name") . " " . $address->getProp("last_name");
    }

    $address->setProp("__display_name", $display_name);
});
