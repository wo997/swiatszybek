<?php //hook[migration]

DB::createTable("order_status", [
    ["name" => "order_status_id", "type" => "INT", "index" => "primary"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "font_clr", "type" => "VARCHAR(255)"],
    ["name" => "bckg_clr", "type" => "VARCHAR(255)"],
]);

//DB::delete("order_status", "1");
$curr_order_status_ids = DB::fetchCol("SELECT order_status_id FROM order_status");

$required_statuses = [
    [
        "order_status_id" => 1,
        "name" => "Oczekuje na płatność",
        "bckg_clr" => "#ed6",
        "font_clr" => "#750"
    ],
    [
        "order_status_id" => 2,
        "name" => "W realizacji",
        "bckg_clr" => "#7d7",
        "font_clr" => "#263"
    ],
    [
        "order_status_id" => 3,
        "name" => "Przekazano do wysyłki",
        "bckg_clr" => "#68d",
        "font_clr" => "#235"
    ],
    [
        "order_status_id" => 4,
        "name" => "Odebrano",
        "bckg_clr" => "#68d",
        "font_clr" => "#235"
    ],
    [
        "order_status_id" => 5,
        "name" => "Anulowano",
        "bckg_clr" => "#d77",
        "font_clr" => "#533"
    ],
    [
        "order_status_id" => 6,
        "name" => "Zwrócono",
        "bckg_clr" => "#d77",
        "font_clr" => "#533"
    ]
];
foreach ($required_statuses as $required_status) {
    if (!in_array($required_status["order_status_id"], $curr_order_status_ids)) {
        DB::insert("order_status", $required_status);
    }
}
