<?php

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
  ["name" => "title", "type" => "VARCHAR(255)"]
]);

dropColumns("slides", ["content"]);

addColumns("slides", [
  ["name" => "content_desktop", "type" => "TEXT"],
  ["name" => "content_mobile", "type" => "TEXT"]
]);


echo "<br><br>✅ All migrations completed";
