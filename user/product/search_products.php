<?php //route[search_products]

$filters = json_decode(nonull($_POST, "product_filters", "{}"), true);

$moduleParams = [];
$module_content = "";
$moduleParams["category_ids"] = nonull($filters, "category_ids", "[]");
$moduleParams["attribute_value_ids"] = nonull($filters, "attribute_value_ids", "[]");
$moduleParams["order_by"] = nonull($filters, "order_by", "");
$moduleParams["search"] = nonull($filters, "search", "");
$moduleParams["basic"] = nonull($filters, "basic", false);
$moduleDir = "modules/product_list";

include $moduleDir . "/content.php";

json_response(
    [
        "content" => $module_content,
        "pageCount" => $products["pageCount"],
        "totalRows" => $products["totalRows"]
    ]
);
