<?php //hook[migration]

DB::createTable("product_image", [
    ["name" => "product_image_id", "type" => "INT", "index" => "primary"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "img_url", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);
