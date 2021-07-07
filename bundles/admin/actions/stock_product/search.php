<?php //route[{ADMIN}/stock_product/search]  

Request::jsonResponse(paginateData([
    "select" => "sp.stock_product_id, sp.net_price, sp.gross_price, sp.vat, sp.product_id, sp.added_at, p.__name",
    "from" => "stock_product sp INNER JOIN product p USING(product_id)",
    "order" => "sp.stock_product_id DESC",
    "quick_search_fields" => ["p.__name"],
    //"where" => "",
    "datatable_params" => $_POST["datatable_params"]
]));
