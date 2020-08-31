<?php

echo "<br><h3>Running all migrations:</h3>";

// migration from 25.07.2020

dropColumns("slides", ["img", "tekst", "link"]);

addColumns("slides", [
  ["name" => "published", "type" => "TINYINT(1)"]
]);

// migration from 27.07.2020

addColumns("basket_content", [
  ["name" => "title", "type" => "VARCHAR(255)"],
  ["name" => "zdjecie", "type" => "VARCHAR(255)"],
  ["name" => "purchase_price", "previous_name" => "purchased_for", "type" => "DECIMAL(10,2)"]
]);

dropColumns("slides", ["content"]);

addColumns("slides", [
  ["name" => "content_desktop", "type" => "TEXT"],
  ["name" => "content_mobile", "type" => "TEXT"]
]);

// migration from 28.07.2020

addColumns("zamowienia", [
  ["name" => "cache_basket", "previous_name" => "basket", "type" => "MEDIUMTEXT"]
]);

addColumns("kody_rabatowe", [
  ["name" => "product_list", "previous_name" => "product_list_metadata", "type" => "TEXT"]
]);

dropColumns("kody_rabatowe", ["product_id_list"]);

// migration from 31.07.2020

addColumns("cms", [
  ["name" => "metadata", "type" => "TEXT"]
]);

addColumns("users", [
  ["name" => "remember_me_token", "type" => "TINYTEXT"]
]);

// migration from 02.08.2020

addColumns("products", [
  ["name" => "gallery", "previous_name" => "image_desktop", "type" => "TEXT"],
]);

// migration from 04.08.2020

addColumns("products", [
  ["name" => "cache_thumbnail", "type" => "TINYTEXT"]
]);

addColumns("cms", [
  ["name" => "seo_description", "previous_name" => "meta_description", "type" => "TINYTEXT"],
  ["name" => "title", "previous_name" => "seo_title", "type" => "TINYTEXT"],
  ["name" => "seo_title", "type" => "TINYTEXT"]
]);

createDatatable("product_attribute_values", [
  ["name" => "product_id", "type" => "INT"],
  ["name" => "attribute_id", "type" => "INT"],
  ["name" => "numerical_value", "type" => "INT", "null" => true],
  ["name" => "text_value", "type" => "TEXT", "null" => true],
  ["name" => "date_value", "type" => "DATE", "null" => true],
]);

createDatatable("link_product_attribute_value",  [
  ["name" => "product_id", "type" => "INT"],
  ["name" => "value_id", "type" => "INT"]
]);

addIndex("link_product_attribute_value", "product_id", "index");
addIndex("link_product_attribute_value", "value_id", "index");

addIndex("link_variant_attribute_value", "variant_id", "index");
addIndex("link_variant_attribute_value", "value_id", "index");

addColumns("attribute_values", [
  ["name" => "additional_data", "type" => "TINYTEXT"],
]);

addColumns("users", [
  ["name" => "user_type", "type" => "VARCHAR(64)"],
  ["name" => "permissions", "type" => "TINYINT"],
]);

addIndex("users", "user_type", "index");

addColumns("link_category_attribute", [
  ["name" => "main_filter", "type" => "TINYINT(1)"],
]);

createDatatable(
  "uploads",
  [
    ["name" => "file_id", "type" => "INT", "primary" => true, "increment" => true],
    ["name" => "file_path", "type" => "VARCHAR(255)"],
    ["name" => "uploaded_file_name", "type" => "VARCHAR(255)"],
    ["name" => "creation_time", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ["name" => "asset_type", "type" => "VARCHAR(255)"],
  ]
);

addIndex("uploads", "asset_type", "index");
addIndex("uploads", "file_path", "unique");

dropTable("images");

echo "<h3>✅ All migrations completed</h3>";
