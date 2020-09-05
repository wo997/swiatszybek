<?php //route[search_products]

$filters = json_decode(nonull($_POST, "product_filters", "{}"), true);

$moduleParams = [];
$module_content = "";
$moduleParams["category_id"] = nonull($filters, "category_id", "[]");
$moduleParams["attribute_value_ids"] = nonull($filters, "attribute_value_ids", "[]");
$moduleDir = "modules/product-list";

include $moduleDir . "/content.php";

json_response(
    [
        "content" => $module_content,
        "pageCount" => $products["pageCount"],
        "totalRows" => $products["totalRows"]
    ]
);
