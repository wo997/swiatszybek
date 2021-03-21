<?php //hook[migration]

DB::createTable("order_status", [
    ["name" => "order_status_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "font_clr", "type" => "VARCHAR(255)"],
    ["name" => "bckg_clr", "type" => "VARCHAR(255)"],
]);

$curr_order_status_ids = DB::fetchCol("SELECT order_status_id FROM order_status");

$required_statuses = [
    [
        "order_status_id" => 1,
        "name" => "Oczekuje na płatność",
        "bckg_clr" => "#ed5",
        "font_clr" => "#750"
    ],
    [
        "order_status_id" => 2,
        "name" => "Opłacono",
        "bckg_clr" => "#7d7",
        "font_clr" => "#263"
    ]
];
foreach ($required_statuses as $required_status) {
    if (!in_array($required_status["order_status_id"], $curr_order_status_ids)) {
        DB::insert("order_status", $required_status);
    }
}
