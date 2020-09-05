<?php //route[admin/create_product]

query("INSERT INTO products (title) VALUES (?)", [$_POST["title"]]);
$id = getLastInsertedId();

json_response(["redirect" => "/admin/produkt/$id"]);
