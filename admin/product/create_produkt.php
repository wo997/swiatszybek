<?php //route[admin/create_product]

query("INSERT INTO products (title) VALUES (?)", [$_POST["title"]]);
$id = getLastInsertedId();

header("Location: /admin/produkt/$id");
die;
