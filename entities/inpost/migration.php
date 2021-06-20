<?php //hook[migration]

DB::createTable("shop_order", [
    ["name" => "inpost_shipment_id", "type" => "INT", "null" => true],
]);
