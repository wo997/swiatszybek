<?php

echo "<br><h3>Running all migrations:</h3>";

// migration from 25.07.2020

if (tableExists("asdadasafds")) {
  query("DROP TABLE asdadasafds");
  echo "table asdadasafds fucked off [: ! <br>";
}

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


echo "<h3>✅ All migrations completed</h3>";
