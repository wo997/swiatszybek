<?php //route[{ADMIN}search_products]  

Request::jsonResponse(paginateData([
    "select" => "product_id, title, published",
    "from" => "products",
    "group" => "product_id",
    "order" => "product_id DESC",
    "quick_search_fields" => ["title"],
    "datatable_params" => $_POST["datatable_params"]
]));
