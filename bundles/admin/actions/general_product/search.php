<?php //route[{ADMIN}/general_product/search]  

$from = "general_product gp INNER JOIN product p USING (general_product_id)";
$where = "1";

$category_ids = def(json_decode($_POST["datatable_params"], true), "category_ids", []);
if ($category_ids) {
    $from .= " INNER JOIN general_product_to_category USING (general_product_id)";
    $category_ids_csv = clean(join(",", $category_ids));
    $where .= " AND product_category_id IN ($category_ids_csv)";
}

Request::jsonResponse(paginateData([
    "select" => "gp.general_product_id, gp.name, gp.__img_url img_url, SUM(p.stock) stock_all, gp.active",
    "from" => $from,
    "group" => "general_product_id",
    "order" => "general_product_id DESC",
    "quick_search_fields" => ["gp.__search"],
    "where" => $where,
    "datatable_params" => $_POST["datatable_params"]
]));
