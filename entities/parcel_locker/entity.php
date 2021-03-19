<?php //hook[entity]

EntityManager::register("parcel_locker", [
    "props" => [
        "name" => ["type" => "string"],
        "country" => ["type" => "string"],
        "post_code" => ["type" => "string"],
        "city" => ["type" => "string"],
        "street" => ["type" => "string"],
        "building_number" => ["type" => "string"],
        "flat_number" => ["type" => "string"],
        "__address_line_1" => ["type" => "string"],
        "__address_line_2" => ["type" => "string"],
        "__display_address" => ["type" => "string"],
    ],
]);

EventListener::register("before_save_parcel_locker_entity", function ($params) {
    /** @var Entity ParcelLocker */
    $parcel_locker = $params["obj"];

    $line_1 = $parcel_locker->getProp("street");
    $line_1 .= " " . $parcel_locker->getProp("building_number");
    $flat_number = $parcel_locker->getProp("flat_number");
    if (trim($flat_number)) {
        $line_1 .= "/" . $flat_number;
    }
    $line_2 = $parcel_locker->getProp("post_code");
    $line_2 .= " " . $parcel_locker->getProp("city");
    //$line_2 .= ", " . $address->getProp("country");

    $display_address = $line_1 . ", " . $line_2;

    $parcel_locker->setProp("__address_line_1", $line_1);
    $parcel_locker->setProp("__address_line_2", $line_2);

    $parcel_locker->setProp("__display_address", $display_address);
});
