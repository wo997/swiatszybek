<?php //route[{ADMIN}create_product]

// TODO: abandon
DB::execute("INSERT INTO products (title) VALUES (?)", [$_POST["title"]]);
$id = DB::insertedId();

redirect(STATIC_URLS["ADMIN"] . "produkt/$id");
