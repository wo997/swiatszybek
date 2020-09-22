<?php //route[search_products]

$module_content = "";
$moduleParams = json_decode(nonull($_POST, "product_filters", "{}"), true);

$moduleDir = "modules/product_list";

include $moduleDir . "/content.php";

json_response(
    [
        "content" => $module_content,
        "pageCount" => $products["pageCount"],
        "totalRows" => $products["totalRows"],
        "price_info" => $price_info
    ]
);
