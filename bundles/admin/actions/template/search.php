<?php //route[{ADMIN}/template/search]  

Request::jsonResponse(paginateData([
    "select" => "t.template_id, t.name, DATE_FORMAT(t.created_at, '%d-%m-%Y %H:%i') created_at, t.page_type, t.pos",
    "from" => "template t",
    "order" => "t.template_id ASC",
    "quick_search_fields" => ["t.name"],
    "where" => "",
    "datatable_params" => $_POST["datatable_params"]
]));
