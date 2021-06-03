<?php //route[{ADMIN}/page/search_templates]  

Request::jsonResponse(paginateData([
    "select" => "p.page_id, p.seo_title, p.seo_description, DATE_FORMAT(p.created_at, '%d-%m-%Y %H:%i') created_at, DATE_FORMAT(p.modified_at, '%d-%m-%Y %H:%i') modified_at, p.template_name",
    "from" => "page p",
    "order" => "p.page_id ASC",
    "quick_search_fields" => ["p.seo_title", "p.seo_description", "p.template_name"],
    "where" => "p.page_type = 'template'",
    "datatable_params" => $_POST["datatable_params"]
]));
