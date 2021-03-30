<?php //route[{USER}/shop_order/search]  

Request::jsonResponse(paginateData([
    "select" => "so.shop_order_id, so.reference, so.total_price, so.delivery_type_id, so.status_id, DATE_FORMAT(so.ordered_at, '%d-%m-%Y %H:%i') ordered_at, ma.__display_name display_address_name, ma.phone, ma.email,
    JSON_ARRAYAGG(JSON_OBJECT('qty', op.qty, 'name', op.name)) ordered_products",
    "from" => "shop_order so INNER JOIN address ma ON ma.address_id = so.main_address_id
        LEFT JOIN ordered_product op USING (shop_order_id)",
    "group" => "shop_order_id",
    "order" => "shop_order_id DESC",
    "quick_search_fields" => ["so.reference"],
    "where" => "user_id = " . User::getCurrent()->getId(),
    "datatable_params" => $_POST["datatable_params"]
]));
