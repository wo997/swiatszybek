<?php //route[{ADMIN}/product/search]  

$from = "product p LEFT JOIN general_product gp USING (general_product_id)";
$where = "1";

$category_ids = def(json_decode($_POST["datatable_params"], true), "category_ids", []);
if ($category_ids) {
    $from .= " INNER JOIN general_product_to_category USING (general_product_id)";
    $category_ids_csv = clean(join(",", $category_ids));
    $where .= " AND product_category_id IN ($category_ids_csv)";
}

Request::jsonResponse(paginateData([
    "select" => "gp.general_product_id, gp.name gp_name,
        p.product_id, p.__name, p.stock, p.__img_url, p.gross_price, p.height, p.length, p.net_price, p.vat_id, p.weight, p.width,
        p.img_url, p.name, p.discount_gross_price, p.discount_untill",
    "from" => $from,
    "group" => "product_id",
    "order" => "product_id DESC",
    "quick_search_fields" => ["p.__name"],
    "where" => $where,
    "datatable_params" => $_POST["datatable_params"]
]));
