<?php //event[product_rating_change]

$rating_data = fetchRow("SELECT AVG(rating) as avg, COUNT(rating) as count FROM comments WHERE product_id = " . $args["product_id"] . " AND accepted = 1 AND rating > 0");
query("UPDATE products SET cache_avg_rating = ?, cache_rating_count = ? WHERE product_id = " . $args["product_id"], [
    $rating_data["avg"], $rating_data["count"]
]);
