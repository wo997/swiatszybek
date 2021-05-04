<?php //route[{ADMIN}/page/get]  

$where = "1";

if ($_POST["general_product_id"]) {
    $general_product_id = intval($_POST["general_product_id"]);
    $where = "p.link_what_id = $general_product_id AND p.page_type = 'general_product'";
}

$page_data = DB::fetchRow("SELECT * FROM page p WHERE $where");
$res = [];
if ($page_data) {
    $res["page"] = $page_data;
}

Request::jsonResponse($res);
