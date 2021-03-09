<?php //hook[migration]

DB::createTable("shop_order", [
    ["name" => "shop_order_id", "type" => "INT", "index" => "primary"],
    ["name" => "reference", "type" => "VARCHAR(255)"],
]);
