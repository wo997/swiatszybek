<?php //hook[migration]

DB::createTable("carrier", [
    ["name" => "carrier_id", "type" => "INT", "index" => "primary"],
    ["name" => "api_key", "type" => "VARCHAR(15)", "index" => "index"],
    ["name" => "img_url", "type" => "VARCHAR(255)", "index" => "index"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "delivery_type_id", "type" => "INT", "index" => "index"],
    ["name" => "dimensions_json", "type" => "TEXT"],
    ["name" => "tracking_url_prefix", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT"],
    ["name" => "delivery_time_days", "type" => "INT"],
    ["name" => "active", "type" => "TINYINT(1)", "index" => "index"],
    ["name" => "__full_name", "type" => "VARCHAR(255)"],
    ["name" => "google_maps_share_link", "type" => "TEXT"],
    ["name" => "google_maps_embed_code", "type" => "TEXT"],
]);

//DB::delete("carrier", "1");
$curr_carrier_keys = DB::fetchCol("SELECT CONCAT(api_key, '.', delivery_type_id) FROM carrier");

$required_carriers = [
    [
        "api_key" => "inpost",
        "delivery_type_id" => 1,
        "name" => "InPost",
        "img_url" => "/src/img/inpost_logo.svg",
        "active" => 0,
        "tracking_url_prefix" => "https://inpost.pl/sledzenie-przesylek?number=",
        "dimensions_json" => json_encode([
            [
                "name" => "A",
                "api_key" => "small",
                "weight" => "25",
                "length" => "64",
                "width" => "38",
                "height" => "8",
                "price" => "0",
            ], [
                "name" => "B",
                "api_key" => "medium",
                "weight" => "25",
                "length" => "64",
                "width" => "38",
                "height" => "19",
                "price" => "0",
            ], [
                "name" => "C",
                "api_key" => "large",
                "weight" => "25",
                "length" => "64",
                "width" => "38",
                "height" => "41",
                "price" => "0",
            ], [
                "name" => "D",
                "api_key" => "xlarge",
                "weight" => "25",
                "length" => "80",
                "width" => "50",
                "height" => "50",
                "price" => "0",
            ]
        ])
    ],
    [
        "api_key" => "ups",
        "delivery_type_id" => 1,
        "name" => "UPS",
        "img_url" => "/src/img/ups_logo.svg",
        "active" => 0,
        "tracking_url_prefix" => "https://upsupsups=",
        "dimensions_json" => json_encode([
            [
                "name" => "A",
                "api_key" => "small",
                "weight" => "25",
                "length" => "64",
                "width" => "38",
                "height" => "8",
                "price" => "0",
            ], [
                "name" => "B",
                "api_key" => "medium",
                "weight" => "25",
                "length" => "64",
                "width" => "38",
                "height" => "19",
                "price" => "0",
            ], [
                "name" => "C",
                "api_key" => "large",
                "weight" => "25",
                "length" => "64",
                "width" => "38",
                "height" => "41",
                "price" => "0",
            ], [
                "name" => "D",
                "api_key" => "xlarge",
                "weight" => "25",
                "length" => "80",
                "width" => "50",
                "height" => "50",
                "price" => "0",
            ]
        ])
    ], [
        "api_key" => "inpost",
        "delivery_type_id" => 2,
        "name" => "InPost",
        "img_url" => "/src/img/inpost_logo.svg",
        "active" => 0,
        "tracking_url_prefix" => "https://inpost.pl/sledzenie-przesylek?number=",
        "dimensions_json" => json_encode([
            [
                "name" => "A",
                "api_key" => "small",
                "weight" => "25",
                "length" => "64",
                "width" => "38",
                "height" => "8",
                "price" => "0",
            ], [
                "name" => "B",
                "api_key" => "medium",
                "weight" => "25",
                "length" => "64",
                "width" => "38",
                "height" => "19",
                "price" => "0",
            ], [
                "name" => "C",
                "api_key" => "large",
                "weight" => "25",
                "length" => "64",
                "width" => "38",
                "height" => "41",
                "price" => "0",
            ], [
                "name" => "D",
                "api_key" => "xlarge",
                "weight" => "25",
                "length" => "80",
                "width" => "50",
                "height" => "50",
                "price" => "0",
            ]
        ])
    ],
];

foreach ($required_carriers as $required_carrier) {
    if (!in_array($required_carrier["api_key"] . "." . $required_carrier["delivery_type_id"], $curr_carrier_keys)) {
        DB::insert("carrier", $required_carrier);
    }
}
