<?php //route[{ADMIN}/page/search_templates]  

Request::jsonResponse(paginateData([
    "select" => "p.page_id, p.seo_title, p.seo_description, p.created_at, p.modified_at, p.template_name",
    "from" => "page p",
    "order" => "p.page_id DESC",
    "quick_search_fields" => ["p.seo_title", "p.seo_description", "p.template_name"],
    "where" => "p.page_type = 'template'",
    "datatable_params" => $_POST["datatable_params"]
]));
