<?php //route[{ADMIN}create_product]

// TODO: abandon
DB::execute("INSERT INTO products (title) VALUES (?)", [$_POST["title"]]);
$id = DB::insertedId();

redirect(Request::$static_urls["ADMIN"] . "produkt/$id");
