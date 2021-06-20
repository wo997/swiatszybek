<?php //hook[migration]

DB::createTable("shop_order", [
    ["name" => "inpost_shipment_id", "type" => "INT", "null" => true],
]);

Files::setCoreImg("src/img/core/carriers/inpost_white.svg", "carrier_inpost_white", "Kurier Inpost");
Files::setCoreImg("src/img/core/carriers/inpost_black.svg", "carrier_inpost_black", "Kurier Inpost");
