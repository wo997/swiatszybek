<?php //route[admin/search_product_categories]

if (isset($_POST["parent_id"])) {
    orderTableBeforeListing("product_categories", "category_id", ["parent_id" => intval($_POST["parent_id"])]);
}

$where = "1";

if (isset($_POST["category_id"])) {
    $where .= " AND category_id = " . intval($_POST["category_id"]);
} else if (isset($_POST["parent_id"])) {
    $where .= " AND parent_id = " . intval($_POST["parent_id"]);
}

$responseArray = paginateData([
    "select" => "category_id, title, link, description, content, icon,
        (SELECT GROUP_CONCAT(title SEPARATOR ', ') FROM product_categories WHERE parent_id = c.category_id) as subcategories,
        (SELECT GROUP_CONCAT(attribute_id SEPARATOR ',') FROM link_category_attribute l WHERE l.category_id = c.category_id) as attributes,
    published, parent_id",
    "from" => "product_categories c",
    "where" => $where,
    "order" => "c.kolejnosc ASC",
    "main_search_fields" => ["c.title"],
    "renderers" => [
        "description_text" => function ($row) {
            return strip_tags($row["description"]);
        },
        "content_text" => function ($row) {
            return strip_tags($row["content"]);
        },
        "attributes" => function ($row) {
            return array_map("intval", explode(",", $row["attributes"]));
        },
    ],
    "raw" => true
]);

if (isset($_POST["include_attributes"])) {
    foreach ($responseArray["results"] as $row_id => $row) {
        $selected_attributes = fetchArray("SELECT attribute_id, main_filter FROM link_category_attribute WHERE category_id = " . $row["category_id"]);
        $responseArray["results"][$row_id]["attributes"] = json_encode(getAssociativeArray($selected_attributes, "attribute_id"));
    }
}

json_response($responseArray);
