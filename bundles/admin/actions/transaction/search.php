<?php //route[{ADMIN}/transaction/search]  

Request::jsonResponse(paginateData([
    "select" => "t.transaction_id, t.reference, t.total_price, t.delivery_type_id, t.carrier_id, t.status_id,
        t.ordered_at, t.package_api_key, t.inpost_shipment_id,
        ma.__display_name display_address_name, ma.phone, ma.email,
        JSON_ARRAYAGG(JSON_OBJECT('qty', op.qty, 'name', op.name)) ordered_products",
    "from" => "transaction so INNER JOIN address ma ON ma.address_id = t.main_address_id
        LEFT JOIN ordered_product op USING (transaction_id)",

    "group" => "transaction_id",
    "order" => "transaction_id DESC",
    "quick_search_fields" => ["t.reference"],
    "datatable_params" => $_POST["datatable_params"]
]));
