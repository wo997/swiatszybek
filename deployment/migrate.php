<?php

// migration from 25.07.2020

if (!tableExists("asdadasafds")) {
  query("CREATE TABLE asdadasafds (
        `dasfdsf` int(11) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

  echo "table asdadasafds created! <br>";
}


dropColumns("slides", ["img", "tekst", "link"]);

addColumns("slides", [["name" => "content", "definition" => "TEXT NOT NULL"]]);
