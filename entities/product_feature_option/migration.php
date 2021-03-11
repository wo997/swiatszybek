<?php //hook[migration]

DB::createTable("product_feature_option", [
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "primary"],
    ["name" => "product_feature_id", "type" => "INT", "index" => "index"],
    ["name" => "parent_product_feature_option_id", "type" => "INT", "index" => "index", "default" => "-1"],
    ["name" => "value", "type" => "VARCHAR(255)", "null" => true],
    ["name" => "double_value", "previous_name" => "float_value", "type" => "DOUBLE", "null" => true, "index" => "index"],
    ["name" => "datetime_value", "type" => "DATETIME", "null" => true, "index" => "index"],
    ["name" => "text_value", "type" => "VARCHAR(255)", "null" => true, "index" => "index"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);

DB::createTable("product_to_feature_option", [
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "index"],
]);

DB::createTable("general_product_to_feature_option", [
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "index"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);
