<?php //route[{ADMIN}/product/feature/search]

// if (isset($_POST["parent_id"])) {
//     orderTableBeforeListing("product_attributes", "attribute_id");
//}

$where = "1";

// $where .= " AND (parent_value_id = 0 OR parent_value_id IS NULL)";



$responseArray = paginateData([
    "select" => "product_feature_id, name, data_type,
        (SELECT GROUP_CONCAT(value SEPARATOR ', ') FROM product_feature_option o WHERE o.product_feature_id = f.product_feature_id) as attr_values
    ",
    "from" => "product_feature f",
    "where" => $where,
    "order" => "pos",
    "quick_search_fields" => ["name"],
    "datatable_params" => $_POST["datatable_params"],
]);

Request::jsonResponse($responseArray);
