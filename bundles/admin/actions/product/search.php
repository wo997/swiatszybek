<?php //route[{ADMIN}/product/search]  

$from = "product p INNER JOIN general_product gp USING (general_product_id)";
$where = "1";

$category_ids = def(json_decode($_POST["datatable_params"], true), "category_ids", []);
if ($category_ids) {
    $from .= " INNER JOIN general_product_to_category USING (general_product_id)";
    $category_ids_csv = clean(join(",", $category_ids));
    $where .= " AND product_category_id IN ($category_ids_csv)";
}

Request::jsonResponse(paginateData([
    "select" => "gp.general_product_id, p.product_id, p.__name product_name, p.stock, p.__img_url img_url",
    "from" => $from,
    "group" => "product_id",
    "order" => "product_id DESC",
    "quick_search_fields" => ["p.__name"],
    "where" => $where,
    "datatable_params" => $_POST["datatable_params"]
]));
