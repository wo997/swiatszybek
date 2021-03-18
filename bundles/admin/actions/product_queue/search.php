<?php //route[{ADMIN}/product_queue/search]  

Request::jsonResponse(paginateData([
    "select" => "product_queue_id, JSON_ARRAYAGG(pq.email) emails, pq.product_id, p.__name product_name, general_product_id",
    "from" => "product_queue pq INNER JOIN product p USING (product_id) INNER JOIN general_product gp USING (general_product_id)",
    "group" => "product_id",
    "order" => "product_queue_id DESC",
    "quick_search_fields" => ["gp.__search", "pq.email", "p.__name"],
    "datatable_params" => $_POST["datatable_params"]
]));
