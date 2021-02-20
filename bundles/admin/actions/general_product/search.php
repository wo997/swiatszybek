<?php //route[{ADMIN}general_product/search]  

Request::jsonResponse(paginateData([
    "select" => "general_product_id, name", //, published",
    "from" => "general_product",
    "group" => "general_product_id",
    "order" => "general_product_id ASC",
    "quick_search_fields" => ["name"],
    "datatable_params" => $_POST["datatable_params"]
]));
