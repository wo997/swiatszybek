<?php //route[{ADMIN}/comment/search]  

Request::jsonResponse(paginateData([
    "select" => "comment_id, comment, rating, u.email, DATE_FORMAT(c.created_at, '%d-%m-%Y %H:%i') created_at, gp.name general_product_name, general_product_id",
    "from" => "comment c INNER JOIN general_product gp USING (general_product_id) INNER JOIN user u USING(user_id)",
    "order" => "comment_id DESC",
    "quick_search_fields" => ["gp.__search", "email", "gp.name"],
    "datatable_params" => $_POST["datatable_params"]
]));
