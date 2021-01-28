<?php

echo "<br><h3>Running all migrations:</h3>";

// migration from 25.07.2020

DB::dropColumns("slides", ["img", "tekst", "link"]);

DB::manageTableColumns("slides", [
    ["name" => "published", "type" => "TINYINT(1)"]
]);

// migration from 27.07.2020

DB::manageTableColumns("basket_content", [
    ["name" => "title", "type" => "VARCHAR(255)"],
    ["name" => "zdjecie", "type" => "VARCHAR(255)"],
    ["name" => "purchase_price", "previous_name" => "purchased_for", "type" => "DECIMAL(10,2)"]
]);

DB::dropColumns("slides", ["content"]);

DB::manageTableColumns("slides", [
    ["name" => "content_desktop", "type" => "TEXT"],
    ["name" => "content_mobile", "type" => "TEXT"]
]);

// migration from 28.07.2020

DB::manageTableColumns("zamowienia", [
    ["name" => "cache_basket", "previous_name" => "basket", "type" => "MEDIUMTEXT"]
]);

DB::manageTableColumns("kody_rabatowe", [
    ["name" => "product_list", "previous_name" => "product_list_metadata", "type" => "TEXT"]
]);

DB::dropColumns("kody_rabatowe", ["product_id_list"]);

// migration from 31.07.2020

DB::manageTableColumns("cms", [
    ["name" => "metadata", "type" => "TEXT"]
]);

DB::manageTableColumns("users", [
    ["name" => "remember_me_token", "type" => "TINYTEXT"]
]);

// migration from 02.08.2020

DB::manageTableColumns("products", [
    ["name" => "gallery", "previous_name" => "image_desktop", "type" => "TEXT"],
]);

// migration from 04.08.2020

DB::manageTableColumns("products", [
    ["name" => "cache_thumbnail", "type" => "TINYTEXT"]
]);

DB::manageTableColumns("cms", [
    ["name" => "seo_description", "previous_name" => "meta_description", "type" => "TINYTEXT"],
    ["name" => "title", "previous_name" => "seo_title", "type" => "TINYTEXT"],
    ["name" => "seo_title", "type" => "TINYTEXT"]
]);

DB::createTable("product_attribute_values", [
    ["name" => "product_id", "type" => "INT"],
    ["name" => "attribute_id", "type" => "INT"],
    ["name" => "numerical_value", "type" => "INT", "null" => true],
    ["name" => "text_value", "type" => "TEXT", "null" => true],
    ["name" => "date_value", "type" => "DATE", "null" => true],
]);

DB::createTable("link_product_attribute_value",  [
    ["name" => "product_id", "type" => "INT"],
    ["name" => "value_id", "type" => "INT"]
]);

DB::addIndex("link_product_attribute_value", "product_id", "index");
DB::addIndex("link_product_attribute_value", "value_id", "index");

DB::addIndex("link_variant_attribute_value", "variant_id", "index");
DB::addIndex("link_variant_attribute_value", "value_id", "index");

DB::manageTableColumns("attribute_values", [
    ["name" => "additional_data", "type" => "TINYTEXT"],
]);

DB::manageTableColumns("users", [
    ["name" => "user_type", "type" => "VARCHAR(64)"],
    ["name" => "privelege_id", "previous_name" => "permissions", "type" => "TINYINT"],
]);

DB::addIndex("users", "user_type", "index");

DB::manageTableColumns("link_category_attribute", [
    ["name" => "main_filter", "type" => "TINYINT(1)"],
]);

DB::createTable(
    "uploads",
    [
        ["name" => "file_id", "type" => "INT", "index" => "primary", "increment" => true],
        ["name" => "file_path", "type" => "VARCHAR(255)"],
        ["name" => "uploaded_file_name", "type" => "VARCHAR(255)"],
        ["name" => "creation_time", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
        ["name" => "asset_type", "type" => "VARCHAR(255)"],
    ]
);

DB::addIndex("uploads", "asset_type", "index");
DB::addIndex("uploads", "file_path", "unique");

DB::dropTable("images");

DB::manageTableColumns("zamowienia", [
    ["name" => "status_id", "previous_name" => "status", "type" => "INT"],
]);

DB::addForeignKey("link_variant_attribute_value", "variant_id", "variant");
//DB::dropForeignKey("link_variant_attribute_value", "variant_id", "variant");

//renameTable("variant", "variants");

DB::manageTableColumns("activity_log", [
    ["name" => "log", "type" => "TINYTEXT"],
    ["name" => "current_state", "type" => "VARCHAR(255)"],
    ["name" => "previous_state", "type" => "VARCHAR(255)"],
]);

DB::dropColumns("zamowienia", ["history"]);

DB::createTable("link_variant_attribute_option", [
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "attribute_id", "type" => "INT", "index" => "index"],
    ["name" => "kolejnosc", "type" => "INT", "index" => "index"],
    ["name" => "attribute_values", "type" => "TEXT", "previous_name" => "values"],
]);

DB::manageTableColumns("users", [
    ["name" => "basket", "type" => "TEXT"],
    ["name" => "last_viewed_products", "type" => "TEXT"],
]);

DB::addForeignKey("variant", "product_id", "products");

DB::manageTableColumns("basket_content", [
    ["name" => "real_price", "type" => "DECIMAL(10,2)"],
    ["name" => "total_price", "type" => "DECIMAL(10,2)"],
    ["name" => "purchase_price", "previous_name" => "purchased_for", "type" => "DECIMAL(10,2)"]
]);

// TODO: someone pls do it
// I recommend creating a general function that removes everything that is not connected, simple concept right? no errors, quick coffee, big dildo

/*DB::addForeignKey("variant", "product_id", "products");
DB::addForeignKey("variant", "product_id", "products");
DB::addForeignKey("variant", "product_id", "products");
DB::addForeignKey("variant", "product_id", "products");*/

DB::manageTableColumns("products", [
    ["name" => "variant_attributes_layout", "type" => "MEDIUMTEXT"],
    ["name" => "variant_filters", "type" => "MEDIUMTEXT"],
]);

DB::manageTableColumns("variant", [
    ["name" => "vat_id", "previous_name" => "vat", "type" => "INT", "index" => "index"],
]);

DB::manageTableColumns("product_attributes", [
    ["name" => "single_product_id", "previous_name" => "product_id", "type" => "INT", "null" => true, "index" => "index"],
]);

DB::manageTableColumns("uploads", [
    ["name" => "user_id", "type" => "INT", "null" => true, "index" => "index"],
]);

DB::createTable("page", [
    ["name" => "page_id", "type" => "INT", "index" => "primary"],
    ["name" => "url", "type" => "TINYTEXT"], // I think we should index that field ezy
    ["name" => "seo_title", "type" => "TINYTEXT"],
    ["name" => "seo_description", "type" => "TINYTEXT"],
    ["name" => "html_content", "type" => "MEDIUMTEXT"],
    ["name" => "settings_json", "type" => "MEDIUMTEXT"],
    ["name" => "published", "type" => "TINYINT(1)"],
]);

DB::createTable("user", [
    ["name" => "user_id", "type" => "INT", "index" => "primary"],
    ["name" => "authenticated", "type" => "TINYINT(1)"],
    ["name" => "first_name", "type" => "VARCHAR(255)"],
    ["name" => "last_name", "type" => "VARCHAR(255)"],
    ["name" => "type", "type" => "VARCHAR(255)"],
    ["name" => "email", "type" => "VARCHAR(255)", "index" => "index"],
    ["name" => "login", "type" => "VARCHAR(255)", "index" => "index"],
    ["name" => "phone", "type" => "VARCHAR(255)"],
    ["name" => "password_hash", "type" => "VARCHAR(255)"],
    ["name" => "authentication_token", "type" => "VARCHAR(255)"],
    ["name" => "authentication_token_untill", "type" => "DATETIME"],
    ["name" => "remember_me_token", "type" => "VARCHAR(255)"],
    ["name" => "visited_at", "type" => "DATETIME"],
    ["name" => "created_at", "type" => "DATETIME"],
    ["name" => "cart_json", "type" => "TEXT"],
    ["name" => "cart_json", "type" => "TEXT"],
    ["name" => "privelege_id", "type" => "TINYINT"],
    //["name" => "last_active_at", "type" => "DATETIME"],
]);

@include BUILDS_PATH . "hooks/migration.php";

echo "<h3>✅ All migrations completed</h3>";
