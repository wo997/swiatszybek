<?php //route[{ADMIN}/page/search]  

Request::jsonResponse(paginateData([
    "select" => "p.page_id, p.seo_title, p.seo_description, DATE_FORMAT(p.created_at, '%d-%m-%Y %H:%i') created_at",
    "from" => "page p",
    "order" => "p.page_id ASC",
    "quick_search_fields" => ["p.seo_title", "p.seo_description"],
    "where" => "",
    "datatable_params" => $_POST["datatable_params"]
]));
