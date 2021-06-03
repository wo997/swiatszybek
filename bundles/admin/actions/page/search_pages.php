<?php //route[{ADMIN}/page/search_pages]  

Request::jsonResponse(paginateData([
    "select" => "p.page_id, p.seo_title, p.seo_description, DATE_FORMAT(p.created_at, '%d-%m-%Y %H:%i') created_at, DATE_FORMAT(p.modified_at, '%d-%m-%Y %H:%i') modified_at, p.url, p.template_id, p.active",
    "from" => "page p",
    "order" => "p.page_id DESC",
    "quick_search_fields" => ["p.seo_title", "p.seo_description", "p.url"],
    "where" => "p.page_type = 'page'",
    "datatable_params" => $_POST["datatable_params"]
]));
