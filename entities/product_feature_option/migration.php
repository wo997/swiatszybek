<?php //hook[migration]

DB::createTable("product_feature_option", [
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "primary"],
    ["name" => "product_feature_id", "type" => "INT", "index" => "index"],
    ["name" => "parent_product_feature_option_id", "type" => "INT", "index" => "index", "null" => true],
    ["name" => "name", "type" => "VARCHAR(255)"],
]);
