<?php //route[{ADMIN}search_products]  

$where = "1";

echo paginateData([
    "select" => "p.product_id, title, p.published, sum(stock) as stock",
    "from" => "products p LEFT JOIN variant v USING(product_id)",
    "where" => $where,
    "group" => "p.product_id",
    "order" => "p.product_id DESC",
    "main_search_fields" => ["p.title"],
    "datatable_params" => json_decode($_POST["datatable_params"], true)
]);
