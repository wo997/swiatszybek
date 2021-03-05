<?php //hook[migration]

DB::createTable("product_img", [
    ["name" => "product_img_id", "type" => "INT", "index" => "primary"],
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "img_url", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
    //["name" => "options_json", "type" => "VARCHAR(255)"],
]);

DB::createTable("product_img_to_feature_option", [
    ["name" => "product_img_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "index"],
]);
