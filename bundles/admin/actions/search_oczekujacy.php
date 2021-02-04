<?php //route[{ADMIN}search_oczekujacy]

Request::jsonResponse(paginateData([
    "select" => "notification_id, n.email email, DATE_FORMAT(requested, '%d-%m-%Y %H:%i') as requested, sent, stock, CONCAT(i.title,' ',v.name) as product, i.product_id",
    "from" => "notifications n LEFT JOIN users u USING(user_id) INNER JOIN variant v ON v.variant_id = n.variant_id INNER JOIN products i ON i.product_id = v.product_id",
    "order" => "n.notification_id DESC",
    "quick_search_fields" => ["n.email", "i.title", "v.name"],
]));
