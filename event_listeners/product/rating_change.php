<?php //event[product_rating_change]

// before and after, so u can choose between using data or validation ;)
// listen comment insert, update, delete
// $args[
//    "inserted_ids" => [123],
//    "updated_ids" => [],
//    "delete_ids" => [5,7],
// ]

$rating_data = fetchRow("SELECT AVG(rating) as avg, COUNT(rating) as count FROM comments
    WHERE product_id = " . $args["product_id"] . " AND accepted = 1 AND rating > 0");

query("UPDATE products SET cache_avg_rating = ?, cache_rating_count = ? WHERE product_id = " . $args["product_id"], [
    $rating_data["avg"], $rating_data["count"]
]);

// return true or false
$product[]