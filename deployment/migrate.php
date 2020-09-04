<?php

echo "<br><h3>Running all migrations:</h3>";

// migration from 25.07.2020

dropColumns("slides", ["img", "tekst", "link"]);

alterTable("slides", [
  ["name" => "published", "type" => "TINYINT(1)"]
]);

// migration from 27.07.2020

alterTable("basket_content", [
  ["name" => "title", "type" => "VARCHAR(255)"],
  ["name" => "zdjecie", "type" => "VARCHAR(255)"],
  ["name" => "purchase_price", "previous_name" => "purchased_for", "type" => "DECIMAL(10,2)"]
]);

dropColumns("slides", ["content"]);

alterTable("slides", [
  ["name" => "content_desktop", "type" => "TEXT"],
  ["name" => "content_mobile", "type" => "TEXT"]
]);

// migration from 28.07.2020

alterTable("zamowienia", [
  ["name" => "cache_basket", "previous_name" => "basket", "type" => "MEDIUMTEXT"]
]);

alterTable("kody_rabatowe", [
  ["name" => "product_list", "previous_name" => "product_list_metadata", "type" => "TEXT"]
]);

dropColumns("kody_rabatowe", ["product_id_list"]);

// migration from 31.07.2020

alterTable("cms", [
  ["name" => "metadata", "type" => "TEXT"]
]);

alterTable("users", [
  ["name" => "remember_me_token", "type" => "TINYTEXT"]
]);

// migration from 02.08.2020

alterTable("products", [
  ["name" => "gallery", "previous_name" => "image_desktop", "type" => "TEXT"],
]);

// migration from 04.08.2020

alterTable("products", [
  ["name" => "cache_thumbnail", "type" => "TINYTEXT"]
]);

alterTable("cms", [
  ["name" => "seo_description", "previous_name" => "meta_description", "type" => "TINYTEXT"],
  ["name" => "title", "previous_name" => "seo_title", "type" => "TINYTEXT"],
  ["name" => "seo_title", "type" => "TINYTEXT"]
]);

createTable("product_attribute_values", [
  ["name" => "product_id", "type" => "INT"],
  ["name" => "attribute_id", "type" => "INT"],
  ["name" => "numerical_value", "type" => "INT", "null" => true],
  ["name" => "text_value", "type" => "TEXT", "null" => true],
  ["name" => "date_value", "type" => "DATE", "null" => true],
]);

createTable("link_product_attribute_value",  [
  ["name" => "product_id", "type" => "INT"],
  ["name" => "value_id", "type" => "INT"]
]);

addIndex("link_product_attribute_value", "product_id", "index");
addIndex("link_product_attribute_value", "value_id", "index");

addIndex("link_variant_attribute_value", "variant_id", "index");
addIndex("link_variant_attribute_value", "value_id", "index");

alterTable("attribute_values", [
  ["name" => "additional_data", "type" => "TINYTEXT"],
]);

alterTable("users", [
  ["name" => "user_type", "type" => "VARCHAR(64)"],
  ["name" => "privelege_id", "previous_name" => "permissions", "type" => "TINYINT"],
]);

addIndex("users", "user_type", "index");

alterTable("link_category_attribute", [
  ["name" => "main_filter", "type" => "TINYINT(1)"],
]);

createTatable(
  "uploads",
  [
    ["name" => "file_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "file_path", "type" => "VARCHAR(255)"],
    ["name" => "uploaded_file_name", "type" => "VARCHAR(255)"],
    ["name" => "creation_time", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
    ["name" => "asset_type", "type" => "VARCHAR(255)"],
  ]
);

addIndex("uploads", "asset_type", "index");
addIndex("uploads", "file_path", "unique");

dropTable("images");

alterTable("zamowienia", [
  ["name" => "status_id", "previous_name" => "status", "type" => "INT"],
]);

//renameTable("variant", "variants");

echo "<h3>✅ All migrations completed</h3>";
