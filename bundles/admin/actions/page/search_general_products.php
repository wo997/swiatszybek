<?php //route[{ADMIN}/page/search_general_products]  

Request::jsonResponse(paginateData([
    "select" => "p.page_id, p.seo_title, p.seo_description, DATE_FORMAT(p.created_at, '%d-%m-%Y %H:%i') created_at, gp.name, p.template_id, gp.__url, p.active",
    "from" => "page p INNER JOIN general_product gp ON p.link_what_id = gp.general_product_id AND p.page_type = 'general_product'",
    "order" => "p.page_id DESC",
    "quick_search_fields" => ["p.seo_title", "p.seo_description", "gp.name"],
    "where" => "",
    "datatable_params" => $_POST["datatable_params"]
]));
