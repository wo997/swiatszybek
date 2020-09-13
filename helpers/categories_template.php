<?php //route[helpers/categories_template]
$raw = $_SERVER["REQUEST_METHOD"] == "POST";

if (!$raw) {
    echo "<template class='categories-template'>";
}

$table_name = isset($_GET["table"]) ? clean($_GET["table"]) : "product_categories";

function showCategory($category, $level = 0)
{
    global $table_name;
    $category_id = $category["category_id"];
    $where = "parent_id = " . intval($category_id);
    $subcategories = fetchArray("SELECT category_id, title, published FROM $table_name WHERE $where ORDER BY kolejnosc");
    $count = count($subcategories);

    $published = $category["published"] ? "" : "style='text-decoration: line-through' data-tooltip='Kategoria jest ukryta!'";
    //$checkbox = $level == 0 ? "" : "<input type='checkbox' onchange='categoryChanged(this)' data-category_id='$category_id'><div class='checkbox'></div>";
    $checkbox = "<input type='checkbox' onchange='categoryChanged(this)' data-category_id='$category_id'><div class='checkbox'></div>";
    echo "<div data-parent_id='$category_id'><div class='category-picker-row'><label>$checkbox</label><span style='color:#555' data-tooltip='Nr kategorii'>$category_id </span><span class='category_name' $published>" . $category["title"] . "</span> <span data-tooltip='Ilość produktów'>($count)</span>";
    if ($count) {
        echo " <div class='btn secondary expand_arrow' onclick='expandWithArrow(this.parent().next(),this)'><i class='fas fa-chevron-right'></i></div>";
    }
    echo "</div><div class='category-picker-column expand_y hidden animate_hidden'>";
    foreach ($subcategories as $subcategory) {
        showCategory($subcategory, $level + 1);
    }
    echo "</div></div>";
}

/*$parent_id = isset($_GET["parent_id"]) ? intval($_GET["parent_id"]) : 0;




//$category = fetchRow("SELECT category_id, title, published FROM product_categories WHERE category_id = $category_id");
if ($parent_id > 0) {
    $category = fetchRow("SELECT category_id, title, published FROM $table_name WHERE category_id = $parent_id");
} else {
    $category = [
        "category_id" => 0,
        "title" => "",
        "published" => 1
    ];
}*/

$category = [
    "category_id" => -1,
    "title" => "",
    "published" => 1
];

//var_dump($category);
showCategory($category); // recursive

if (!$raw) {
    echo "</template>";
}
