<?php //route[/comment/search]  

$data = paginateData([
    "select" => "c.comment_id, c.comment, c.rating, u.nickname, c.created_at, JSON_ARRAYAGG(product_feature_option_id)",
    "from" => "comment c LEFT JOIN user u USING(user_id) LEFT JOIN comment_to_product_feature_option ctpfo USING (comment_id)",
    "order" => "comment_id DESC",
    "group" => "comment_id",
    "datatable_params" => $_POST["datatable_params"]
]);

Request::jsonResponse($data);
