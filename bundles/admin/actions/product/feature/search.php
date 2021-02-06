<?php //route[{ADMIN}product/feature/search]

// if (isset($_POST["parent_id"])) {
//     orderTableBeforeListing("product_attributes", "attribute_id");
//}

$where = "1";

// $where .= " AND (parent_value_id = 0 OR parent_value_id IS NULL)";

$responseArray = paginateData([
    "select" => "product_feature_id, name",/*, data_type,
        GROUP_CONCAT(v.value ORDER BY v.kolejnosc ASC) as attr_values
    ",*/
    "from" => "product_feature", // a LEFT JOIN attribute_values v USING(attribute_id)",
    "where" => $where,
    //"order" => "a.kolejnosc ASC",
    //"group" => "product_feature_id",
    "quick_search_fields" => ["a.name"],
    "datatable_params" => $_POST["datatable_params"],
]);

Request::jsonResponse($responseArray);
