<?php //route[search_products]

$moduleParams = [];
$module_content = "";
$moduleParams["category_id"] = $show_category["category_id"];
$moduleParams["attribute_value_ids"] = nonull($_POST, "attribute_value_ids", "[]");
include "modules/product-list/content.php";
echo $module_content;
