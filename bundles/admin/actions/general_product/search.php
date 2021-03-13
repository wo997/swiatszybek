<?php //route[{ADMIN}/general_product/search]  

Request::jsonResponse(paginateData([
    "select" => "gp.general_product_id, gp.name, gp.__img_url",
    "from" => "general_product gp",
    "group" => "general_product_id",
    "order" => "general_product_id DESC",
    "quick_search_fields" => ["gp.__search"],
    "datatable_params" => $_POST["datatable_params"]
]));
