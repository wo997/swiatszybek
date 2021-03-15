<?php //route[{ADMIN}/shop_order/search]  

Request::jsonResponse(paginateData([
    "select" => "so.shop_order_id, so.reference, so.total_price",
    "from" => "shop_order so",
    "group" => "shop_order_id",
    "order" => "shop_order_id DESC",
    "quick_search_fields" => ["so.reference"],
    "datatable_params" => $_POST["datatable_params"]
]));
