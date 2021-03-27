<?php //route[{ADMIN}/user/search]  

Request::jsonResponse(paginateData([
    "select" => "user_id, first_name, last_name, email, phone, role_id",
    "from" => "user",
    "order" => "user_id ASC",
    "quick_search_fields" => ["first_name", "last_name", "email"],
    "where" => "authenticated",
    "datatable_params" => $_POST["datatable_params"]
]));
