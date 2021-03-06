<?php //hook[migration]

DB::createTable("product_feature_option", [
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "primary"],
    ["name" => "product_feature_id", "type" => "INT", "index" => "index"],
    ["name" => "parent_product_feature_option_id", "type" => "INT", "index" => "index", "default" => "-1"],
    ["name" => "value", "type" => "VARCHAR(255)"],
    ["name" => "double_value", "type" => "DOUBLE", "null" => true, "index" => "index"],
    ["name" => "double_base", "type" => "VARCHAR(255)", "null" => true],
    ["name" => "unit_id", "type" => "VARCHAR(15)", "null" => true],
    ["name" => "datetime_value", "type" => "DATETIME", "null" => true, "index" => "index"],
    ["name" => "text_value", "type" => "TEXT", "null" => true],
    ["name" => "pos", "type" => "INT", "index" => "index"],
    ["name" => "extra_json", "type" => "TEXT"],
    ["name" => "just_general_product_id", "previous_name" => "general_product_id", "type" => "INT", "null" => true, "index" => "index"],
]);

DB::createTable("general_product_to_feature_option", [
    ["name" => "general_product_id", "type" => "INT", "index" => "index"],
    ["name" => "product_feature_option_id", "type" => "INT", "index" => "index"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
]);
