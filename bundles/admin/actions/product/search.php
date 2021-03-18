<?php //route[{ADMIN}/product/search]  

Request::jsonResponse(paginateData([
    "select" => "gp.general_product_id, p.product_id, p.__name name, p.stock, p.__img_url img_url",
    "from" => "product p INNER JOIN general_product gp USING (general_product_id)",
    "group" => "product_id",
    "order" => "product_id DESC",
    "quick_search_fields" => ["p.__name"],
    "datatable_params" => $_POST["datatable_params"]
]));
