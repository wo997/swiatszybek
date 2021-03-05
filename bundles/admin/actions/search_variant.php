<?php //route[{ADMIN}/search_variant]  

orderTableBeforeListing("variant", "variant_id");

$where = "1";

$status = isset($_POST["status"]) ? $_POST["status"] : "";

if ($status != "") {
    if ($status == "brak")
        $where .= " AND quantity = 0";
    if ($status == "published")
        $where .= " AND variant_published AND published";
}

if (isset($_POST["product_id"])) {
    $where .= " AND product_id = " . intval($_POST["product_id"]);
}

$order = "v.kolejnosc ASC";

if (isset($_POST["order"])) {
    $order = clean($_POST["order"]);
}


//(SELECT GROUP_CONCAT(value_id SEPARATOR ',') FROM link_variant_attribute_value WHERE variant_id = v.variant_id) as attribute_selected_values,
//(SELECT GROUP_CONCAT(CONCAT(attribute_id, ',', numerical_value, ',', text_value, ',', date_value) SEPARATOR ',') FROM variant_attribute_values WHERE variant_id = v.variant_id) as attribute_values

Request::jsonResponse(paginateData([
    "select" => "variant_id, title, name, stock, v.published published, p.published product_published, product_id, price, rabat, color, product_code, zdjecie",
    "from" => "variant v LEFT JOIN products p USING(product_id)",
    "where" => $where,
    "order" => $order,
    "quick_search_fields" => ["p.title", "v.name", "v.name"],
]));
