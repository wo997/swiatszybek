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
  ["name" => "image", "type" => "TINYTEXT"],
]);

createTable("environment", [
  ["name" => "modification_time", "type" => "INT"]
]);

echo "<h3>✅ All migrations completed</h3>";
