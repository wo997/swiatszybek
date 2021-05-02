<?php //route[{ADMIN}/page/search]  

// Request::jsonResponse(paginateData([
//     "select" => "p.page_id, p.seo_title, p.seo_description, DATE_FORMAT(p.created_at, '%d-%m-%Y %H:%i') created_at, p.link_what, gp.name",
//     "from" => "page p LEFT JOIN general_product gp ON p.link_what_id = gp.general_product_id AND p.link_what = 'general_product'",
//     "order" => "p.page_id ASC",
//     "quick_search_fields" => ["p.seo_title", "p.seo_description"],
//     "where" => "",
//     "datatable_params" => $_POST["datatable_params"]
// ]));
