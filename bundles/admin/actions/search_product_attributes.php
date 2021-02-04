<?php //route[{ADMIN}search_product_attributes]

if (isset($_POST["parent_id"])) {
    orderTableBeforeListing("product_attributes", "attribute_id");
}

$where = "1";

$where .= " AND (parent_value_id = 0 OR parent_value_id IS NULL)";

if (isset($_POST["attribute_id"])) {
    $where .= " AND attribute_id = " . intval($_POST["attribute_id"]);
}

$responseArray = paginateData([
    "select" => "attribute_id, name, data_type,
        GROUP_CONCAT(v.value ORDER BY v.kolejnosc ASC) as attr_values
    ",
    "from" => "product_attributes a LEFT JOIN attribute_values v USING(attribute_id)",
    "where" => $where,
    "order" => "a.kolejnosc ASC",
    "group" => "attribute_id",
    "quick_search_fields" => ["a.name"],
    "datatable_params" => $_POST["datatable_params"],
]);

if (isset($_POST["everything"])) {
    foreach ($responseArray["results"] as $row_id => $row) {
        $selected_attributes = DB::fetchArr("SELECT category_id, main_filter FROM link_category_attribute WHERE attribute_id = " . $row["attribute_id"]);
        $responseArray["results"][$row_id]["categories"] = json_encode($selected_attributes);

        $values = getAttributeValues(intval($row['attribute_id']));
        $responseArray["results"][$row_id]["attribute_values_" . $row['data_type']] = json_encode($values);
    }
}

Request::jsonResponse($responseArray);
