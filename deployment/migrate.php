<?php

// migration from 25.07.2020

if (tableExists("asdadasafds")) {
  query("DROP TABLE asdadasafds");
  echo "table asdadasafds fucked off [: ! <br>";
}

dropColumns("slides", ["img", "tekst", "link"]);

addColumns("slides", [
  ["name" => "content", "type" => "TEXT"]
]);

// migration from 27.07.2020

addColumns("basket_content", [
  ["name" => "title", "type" => "VARCHAR(255)"],
  ["name" => "zdjecie", "type" => "VARCHAR(255)"],
  ["name" => "purchase_price", "previous_name" => "purchased_for", "type" => "DECIMAL(10,2)"]
]);

addColumns("zamowienia", [
  ["name" => "cache_basket", "previous_name" => "basket", "type" => "MEDIUMTEXT"]
]);



echo "<br><br>✅ All migrations completed";
