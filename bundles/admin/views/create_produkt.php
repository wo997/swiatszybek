<?php //route[{ADMIN}create_product]

// TODO: abandon
query("INSERT INTO products (title) VALUES (?)", [$_POST["title"]]);
$id = getLastInsertedId();

redirect(STATIC_URLS["ADMIN"] . "produkt/$id");
