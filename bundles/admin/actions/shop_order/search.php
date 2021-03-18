<?php //route[{ADMIN}/shop_order/search]  

Request::jsonResponse(paginateData([
    "select" => "so.shop_order_id, so.reference, so.total_price, so.delivery_id, so.status_id,
        __display_name, ma.phone, ma.email
    ",
    "from" => "shop_order so INNER JOIN address ma ON ma.address_id = so.main_address_id",
    "group" => "shop_order_id",
    "order" => "shop_order_id DESC",
    "quick_search_fields" => ["so.reference"],
    "datatable_params" => $_POST["datatable_params"]
]));
