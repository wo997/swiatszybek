<?php //hook[migration]

DB::createTable("delivery_type", [
    ["name" => "delivery_type_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "text", "type" => "VARCHAR(255)"],
]);

//DB::delete("delivery_type", "1");
$curr_delivery_type_ids = DB::fetchCol("SELECT delivery_type_id FROM delivery_type");

$required_delivery_types = [
    [
        "delivery_type_id" => 1,
        "name" => "Kurier",
        "text" => "courier",
    ],
    [
        "delivery_type_id" => 2,
        "name" => "Paczkomat",
        "text" => "parcel_locker",
    ],
    [
        "delivery_type_id" => 3,
        "name" => "Odbiór osobisty",
        "text" => "in_person",
    ],
];
foreach ($required_delivery_types as $required_delivery_type) {
    if (!in_array($required_delivery_type["delivery_type_id"], $curr_delivery_type_ids)) {
        DB::insert("delivery_type", $required_delivery_type);
    }
}
