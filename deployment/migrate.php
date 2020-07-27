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
  ["name" => "content_desktop", "type" => "VARCHAR(255)"],
  ["name" => "content_mobile", "type" => "VARCHAR(255)"]
]);



echo "<br><br>✅ All migrations completed";
