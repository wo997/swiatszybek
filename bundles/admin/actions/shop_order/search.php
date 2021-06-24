<?php //route[{ADMIN}/shop_order/search]  

Request::jsonResponse(paginateData([
    "select" => "so.shop_order_id, so.reference, so.total_price, so.delivery_type_id, so.carrier_id, so.status_id,
        so.ordered_at, so.package_api_key, so.inpost_shipment_id,
        ma.__display_name display_address_name, ma.phone, ma.email,
        JSON_ARRAYAGG(JSON_OBJECT('qty', op.qty, 'name', op.name)) ordered_products",
    "from" => "shop_order so INNER JOIN address ma ON ma.address_id = so.main_address_id
        LEFT JOIN ordered_product op USING (shop_order_id)",

    // so.carrier_id, so.payment_time, CONCAT(dt.name, ' ', c.name) carrier_full_name
    // LEFT JOIN delivery_type dt USING (delivery_type_id)
    // LEFT JOIN carrier c USING (carrier_id)
    "group" => "shop_order_id",
    "order" => "shop_order_id DESC",
    "quick_search_fields" => ["so.reference"],
    "datatable_params" => $_POST["datatable_params"]
]));
