<?php //->[admin/search_product_attributes]

if (isset($_POST["parent_id"])) {
    orderTableBeforeListing("product_attributes","attribute_id");
}

$where = "1";

if (isset($_POST['attribute_id']))
{
    $where .= getListCondition("attribute_id",$_POST['attribute_id']);
}

$where .= " AND parent_value_id = 0";

echo getTableData([
    "select" => "attribute_id, name, data_type,
        GROUP_CONCAT(v.value_id ORDER BY v.kolejnosc ASC) as attr_ids,
        GROUP_CONCAT(v.value ORDER BY v.kolejnosc ASC) as attr_values
    ",
    "from" => "product_attributes a LEFT JOIN attribute_values v USING(attribute_id)",
    "where" => $where,
    "order" => "a.kolejnosc ASC",
    "group" => "attribute_id",
    "main_search_fields" => ["a.name"]
]);
