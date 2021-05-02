<?php //route[{ADMIN}/page/search_product_categories]  

Request::jsonResponse(paginateData([
    "select" => "p.page_id, p.seo_title, p.seo_description, DATE_FORMAT(p.created_at, '%d-%m-%Y %H:%i') created_at, pc.name, pc.__category_path_names_csv",
    "from" => "page p INNER JOIN product_category pc ON p.link_what_id = pc.product_category_id AND p.link_what = 'product_category'",
    "order" => "p.page_id ASC",
    "quick_search_fields" => ["p.seo_title", "p.seo_description", "gp.name", "pc.__category_path_names_csv"],
    "where" => "",
    "datatable_params" => $_POST["datatable_params"]
]));
