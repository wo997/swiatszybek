<?php //route[search_products]

$filters = json_decode(nonull($_POST, "filters", "{}"), true);

$moduleParams = [];
$module_content = "";
$moduleParams["category_id"] = nonull($filters, "category_id", "[]");
$moduleParams["attribute_value_ids"] = nonull($filters, "attribute_value_ids", "[]");

include "modules/product-list/content.php";

die(json_encode(
    [
        "content" => $module_content,
        "pageCount" => $products["pageCount"],
        "totalRows" => $products["totalRows"]
    ]
));
