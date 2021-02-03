<?php //route[{ADMIN}search_products]  

json_response(paginateData([
    "select" => "p.product_id, title, p.published, sum(stock) as stock",
    "from" => "products p LEFT JOIN variant v USING(product_id)",
    "group" => "p.product_id",
    "order" => "p.product_id DESC",
    "quick_search_fields" => ["p.title"],
    "datatable_params" => json_decode($_POST["datatable_params"], true)
]));
