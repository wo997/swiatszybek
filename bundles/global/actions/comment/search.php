<?php //route[/comment/search]  

Request::jsonResponse(paginateData([
    "select" => "c.comment_id, c.comment, c.rating, u.nickname, c.created_at",
    "from" => "comment c LEFT JOIN user u USING(user_id)",
    "order" => "comment_id DESC",
    "datatable_params" => $_POST["datatable_params"]
]));
