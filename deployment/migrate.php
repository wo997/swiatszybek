<?php

// var_dump(fetchArray("SELECT * FROM products WHERE product_id = ?", [7]));
if (!tableExists(clean("asdadasafds"))) {
    query("CREATE TABLE `asdadasafds` (
        `dasfdsf` int(11) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    echo "table asdadasafds created!";
}
