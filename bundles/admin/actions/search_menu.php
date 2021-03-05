<?php //route[/{ADMIN}search_menu]

if (isset($_POST["parent_id"])) {
    orderTableBeforeListing("menu", "category_id", ["parent_id" => intval($_POST["parent_id"])]);
}

$where = "1";

if (isset($_POST["category_id"])) {
    $where .= " AND category_id = " . intval($_POST["category_id"]);
} else {
    $where .= " AND parent_id = " . intval($_POST["parent_id"]);
}

Request::jsonResponse(paginateData([
    "select" => "category_id, m.title, (
        SELECT GROUP_CONCAT(sm.title SEPARATOR ', ') FROM menu sm WHERE sm.parent_id = m.category_id) as subcategories,
    m.published, parent_id, url, cms_id, cms.title as cms_title, cms.link as cms_url, i.product_id as product_id, i.title as product_title, i.link as product_link",
    "from" => "menu m LEFT JOIN cms USING (cms_id) LEFT JOIN products i USING(product_id)",
    "where" => $where,
    "order" => "m.kolejnosc ASC",
    "quick_search_fields" => ["m.title"],
    "renderers" => [
        "actual_link" => function ($row) {
            return getMenuLink($row);
        }
    ]
]));
