<?php //route[{ADMIN}/file/search]

Request::jsonResponse(paginateData([
    "select" => "file_id, file_path, original_file_name, uploaded_at,file_type,user.email user_email",
    "from" => "file LEFT JOIN user USING(user_id)",
    "order" => "file_id DESC",
    "quick_search_fields" => ["file_path", "original_file_name", "user.email"],
    "datatable_params" => $_POST["datatable_params"]
]));
