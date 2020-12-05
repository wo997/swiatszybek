<?php

echo "<br><h3>Running all migrations:</h3>";

// migration from 25.07.2020

dropColumns("slides", ["img", "tekst", "link"]);

manageTableColumns("slides", [
    ["name" => "published", "type" => "TINYINT(1)"]
]);

// migration from 27.07.2020

manageTableColumns("basket_content", [
    ["name" => "title", "type" => "VARCHAR(255)"],
    ["name" => "zdjecie", "type" => "VARCHAR(255)"],
    ["name" => "purchase_price", "previous_name" => "purchased_for", "type" => "DECIMAL(10,2)"]
]);

dropColumns("slides", ["content"]);

manageTableColumns("slides", [
    ["name" => "content_desktop", "type" => "TEXT"],
    ["name" => "content_mobile", "type" => "TEXT"]
]);

// migration from 28.07.2020

manageTableColumns("zamowienia", [
    ["name" => "cache_basket", "previous_name" => "basket", "type" => "MEDIUMTEXT"]
]);

manageTableColumns("kody_rabatowe", [
    ["name" => "product_list", "previous_name" => "product_list_metadata", "type" => "TEXT"]
]);

dropColumns("kody_rabatowe", ["product_id_list"]);

// migration from 31.07.2020

manageTableColumns("cms", [
    ["name" => "metadata", "type" => "TEXT"]
]);

manageTableColumns("users", [
    ["name" => "remember_me_token", "type" => "TINYTEXT"]
]);

// migration from 02.08.2020

manageTableColumns("products", [
    ["name" => "gallery", "previous_name" => "image_desktop", "type" => "TEXT"],
]);

// migration from 04.08.2020

manageTableColumns("products", [
    ["name" => "cache_thumbnail", "type" => "TINYTEXT"]
]);

manageTableColumns("cms", [
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

manageTableColumns("attribute_values", [
    ["name" => "additional_data", "type" => "TINYTEXT"],
]);

manageTableColumns("users", [
    ["name" => "user_type", "type" => "VARCHAR(64)"],
    ["name" => "privelege_id", "previous_name" => "permissions", "type" => "TINYINT"],
]);

addIndex("users", "user_type", "index");

manageTableColumns("link_category_attribute", [
    ["name" => "main_filter", "type" => "TINYINT(1)"],
]);

createTable(
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

manageTableColumns("zamowienia", [
    ["name" => "status_id", "previous_name" => "status", "type" => "INT"],
]);

addForeignKey("link_variant_attribute_value", "variant_id", "variant");
//dropForeignKey("link_variant_attribute_value", "variant_id", "variant");

//renameTable("variant", "variants");

manageTableColumns("activity_log", [
    ["name" => "log", "type" => "TINYTEXT"],
    ["name" => "current_state", "type" => "VARCHAR(255)"],
    ["name" => "previous_state", "type" => "VARCHAR(255)"],
]);

dropColumns("zamowienia", ["history"]);

createTable("link_variant_attribute_option", [
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "attribute_id", "type" => "INT", "index" => "index"],
    ["name" => "kolejnosc", "type" => "INT", "index" => "index"],
    ["name" => "attribute_values", "type" => "TEXT", "previous_name" => "values"],
]);

manageTableColumns("users", [
    ["name" => "basket", "type" => "TEXT"],
    ["name" => "last_viewed_products", "type" => "TEXT"],
]);

addForeignKey("variant", "product_id", "products");

manageTableColumns("basket_content", [
    ["name" => "real_price", "type" => "DECIMAL(10,2)"],
    ["name" => "total_price", "type" => "DECIMAL(10,2)"],
    ["name" => "purchase_price", "previous_name" => "purchased_for", "type" => "DECIMAL(10,2)"]
]);

// TODO: someone pls do it
// I recommend creating a general function that removes everything that is not connected, simple concept right? no errors, quick coffee, big dildo

/*addForeignKey("variant", "product_id", "products");
addForeignKey("variant", "product_id", "products");
addForeignKey("variant", "product_id", "products");
addForeignKey("variant", "product_id", "products");*/

manageTableColumns("products", [
    ["name" => "variant_attributes_layout", "type" => "MEDIUMTEXT"],
    ["name" => "variant_filters", "type" => "MEDIUMTEXT"],
]);

manageTableColumns("variant", [
    ["name" => "vat_id", "previous_name" => "vat", "type" => "INT", "index" => "index"],
]);

manageTableColumns("product_attributes", [
    ["name" => "single_product_id", "previous_name" => "product_id", "type" => "INT", "null" => true, "index" => "index"],
]);

manageTableColumns("uploads", [
    ["name" => "user_id", "type" => "INT", "null" => true, "index" => "index"],
]);

createTable("pies", [
    ["name" => "pies_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "food", "type" => "INT"],
    ["name" => "ate_at", "type" => "DATETIME", "index" => "index"],
]);

echo "<h3>✅ All migrations completed</h3>";
