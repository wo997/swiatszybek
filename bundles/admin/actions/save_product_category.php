<?php //route[{ADMIN}/save_product_category]

if (isset($_POST["remove"])) {
    DB::execute("DELETE FROM product_categories WHERE category_id = ?", [
        $_POST["category_id"]
    ]);
} else {
    $category_id = isset($_POST["category_id"]) ? $_POST["category_id"] : "-1";
    if ($category_id == "-1") {
        DB::execute("INSERT INTO product_categories () VALUES ()");
        $category_id = DB::insertedId();
    } else {
        $category_id = $_POST["category_id"];
    }

    $parent_id = $_POST["parent_id"] ? intval($_POST["parent_id"]) : 0;

    DB::execute("UPDATE product_categories SET title = ?, published = ?, parent_id = ?, link = ?, description = ?, content = ?, icon = ? WHERE category_id = " . intval($category_id), [
        $_POST["title"], $_POST["published"], $parent_id, $_POST["link"], $_POST["description"], $_POST["content"], $_POST["icon"]
    ]);

    // link attributes
    DB::execute("DELETE FROM link_category_attribute WHERE category_id = ?", [$category_id]);
    $insert = "";
    foreach (json_decode($_POST["attributes"], true) as $attribute) {
        $attribute_id = intval($attribute["attribute_id"]);
        $main_filter = intval($attribute["main_filter"]);
        $insert .= "($category_id,$attribute_id,$main_filter),";
    }
    $insert = substr($insert, 0, -1);
    DB::execute("INSERT INTO link_category_attribute (category_id, attribute_id, main_filter) VALUES $insert");
}

die;
