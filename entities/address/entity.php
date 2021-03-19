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
        "post_code" => ["type" => "string"],
        "city" => ["type" => "string"],
        "street" => ["type" => "string"],
        "building_number" => ["type" => "string"],
        "flat_number" => ["type" => "string"],
        "__display_name" => ["type" => "string"],
        "__address_line_1" => ["type" => "string"],
        "__address_line_2" => ["type" => "string"],
        "__display_address" => ["type" => "string"],
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

    $line_1 = $address->getProp("street");
    $line_1 .= " " . $address->getProp("building_number");
    $flat_number = $address->getProp("flat_number");
    if (trim($flat_number)) {
        $line_1 .= "/" . $flat_number;
    }
    $line_2 = $address->getProp("post_code");
    $line_2 .= " " . $address->getProp("city");
    //$line_2 .= ", " . $address->getProp("country");

    $display_address = $line_1 . ", " . $line_2;

    $address->setProp("__address_line_1", $line_1);
    $address->setProp("__address_line_2", $line_2);

    $address->setProp("__display_address", $display_address);
});
