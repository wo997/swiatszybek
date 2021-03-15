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

// "party" => ["type" => "string"],
//         "first_name" => ["type" => "string"],
//         "last_name" => ["type" => "string"],
//         "company" => ["type" => "string"],
//         "nip" => ["type" => "string"],
//         "phone" => ["type" => "string"],
//         "email" => ["type" => "string"],
//         "country" => ["type" => "string"],
//         "postal_code" => ["type" => "string"],
//         "city" => ["type" => "string"],
//         "street" => ["type" => "string"],
//         "house_number" => ["type" => "string"],
//         "apartment_number" => ["type" => "string"],