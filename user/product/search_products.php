<?php //route[search_products]

$attribute_value_ids = json_decode(nonull($_POST, "attribute_value_ids", "[]"));

$where = "1";
foreach ($attribute_value_ids as $attribute_value_sub_ids) {
    $subAttributeValues = "";
    foreach ($attribute_value_sub_ids as $attribute_value_id) {
        $subAttributeValues .= "$attribute_value_id,";
    }
    if ($subAttributeValues) {
        $where .= " AND value_id IN(" . rtrim($subAttributeValues, ",") . ")";
    }
}

die($where);
$moduleParams = [];
$module_content = "";
$moduleParams["category_id"] = $show_category["category_id"];
include "modules/product-list/content.php";
echo $module_content;
