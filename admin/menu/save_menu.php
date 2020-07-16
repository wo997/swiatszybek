<?php //->[admin/save_menu]

if (isset($_POST["remove"])) {
    query("DELETE FROM menu WHERE category_id = ?",[
        $_POST["category_id"]
    ]);
}
else {
    $category_id = isset($_POST["category_id"]) ? $_POST["category_id"] : "-1";
    if ($category_id == "-1") {
        query("INSERT INTO menu () VALUES ()");
        $category_id = getLastInsertedId();
    }
    else {
        $category_id = $_POST["category_id"];
    }

    $parent_id = $_POST["parent_id"] ? intval($_POST["parent_id"]) : 0;
    $cms_id = $_POST["cms_id"] ? intval($_POST["cms_id"]) : null;
    $product_id = $_POST["product_id"] ? intval($_POST["product_id"]) : null;

    query("UPDATE menu SET title = ?, published = ?, parent_id = ?, product_id = ?, cms_id = ?, url = ? WHERE category_id = ".intval($category_id),[
        $_POST["title"], $_POST["published"], $parent_id, $product_id, $cms_id, $_POST["url"]
    ]);
}

include "events/topmenu_change.php";

die;
