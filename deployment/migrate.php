<?php

// migration from 25.07.2020

if (!tableExists("asdadasafds")) {
  query("CREATE TABLE asdadasafds (
        `dasfdsf` int(11) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

  echo "table asdadasafds created! <br>";
}

if (!columnExists("asdadasafds", "col")) {
  query("ALTER TABLE asdadasafds ADD col VARCHAR(255) NOT NULL AFTER `dasfdsf`;");

  echo "column col in asdadasafds added! <br>";
}
