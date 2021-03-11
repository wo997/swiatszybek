<?php //route[/produkty]

$product_category_data = null;

$product_category_id = Request::urlParam(1, -1);
if ($product_category_id) {
    $product_category_id = intval($product_category_id);
    $product_category_data = DB::fetchRow("SELECT name, __category_path_json FROM product_category WHERE product_category_id = $product_category_id");
}

$selected_option_groups = [];
foreach (explode("-", def($_GET, "v", "")) as $option_ids_str) {
    $selected_option_groups[] = array_map(fn ($x) => intval($x), explode("_", $option_ids_str));
}

$page_id = intval(def($_GET, "str", 1)) - 1;
$row_count = intval(def($_GET, "ile", 25));

function traverseCategories($parent_id = -1, $level = 0)
{
    $categories = DB::fetchArr("SELECT product_category_id, name, __category_path_json, __product_count FROM product_category WHERE parent_product_category_id = $parent_id ORDER BY pos ASC");
    if (!$categories) {
        return "";
    }
    $html = "<ul class=\"level_$level\">";
    foreach ($categories as $category) {
        $id = $category["product_category_id"];
        $name = $category["name"];
        $count = $category["__product_count"];
        $link = getProductCategoryLink(json_decode($category["__category_path_json"], true));

        $html .= "<li data-category_id=\"$id\" >";
        $html .= "<a href=\"$link\">$name";
        $html .= " <span class=\"count\">($count)</span>";
        $html .= "</a>";
        $html .= traverseCategories($category["product_category_id"], $level + 1);
        $html .= "</li>";
    }
    $html .= "</ul>";
    return $html;
}

function traverseFeatureOptions($feature_id, $parent_feature_option_id = -1, $level = 0)
{
    global $option_count;

    $where = "parent_product_feature_option_id = $parent_feature_option_id";
    if ($parent_feature_option_id === -1) {
        $where .= " AND product_feature_id = $feature_id";
    }
    $product_feature_options = DB::fetchArr("SELECT product_feature_option_id, value FROM product_feature_option WHERE $where ORDER BY pos ASC");
    if (!$product_feature_options) {
        return "";
    }
    $html = "<ul class=\"level_$level\">";
    $display = false;
    foreach ($product_feature_options as $option) {
        $id = $option["product_feature_option_id"];
        $value = $option["value"];
        $count = def($option_count, $id, 0);

        if ($count) {
            $display = true;
        }

        $html .= "<li class=\"option_row\">";
        $html .= "<div class=\"checkbox_area\">";
        $html .= "<p-checkbox class=\"square inline option_checkbox\" data-option_id=\"$id\"></p-checkbox>";
        $html .= " <span class=\"feature_option_label\">$value</span>";
        $html .= " <span class=\"count\">($count)</span>";
        $html .= "</div> ";
        $html .= traverseFeatureOptions($feature_id, $id, $level + 1);
        $html .= "</li>";
    }
    $html .= "</ul>";
    return $display ? $html : null;
}

function traverseFeatures()
{
    global $where_products_0;

    $product_features = DB::fetchArr("SELECT product_feature_id, name, data_type, physical_measure FROM product_feature ORDER BY pos ASC");
    if (!$product_features) {
        return "";
    }
    $html = "<ul>";
    foreach ($product_features as $product_feature) {
        $product_feature_id = $product_feature["product_feature_id"];
        $options_html = "";
        if (endsWith($product_feature["data_type"], "_list")) {
            $options_html = traverseFeatureOptions($product_feature_id);
        } else {
            $data = DB::fetchRow("SELECT MIN(double_value) min_value, MAX(double_value) max_value FROM product_feature_option
                INNER JOIN product_to_feature_option ptfo USING(product_feature_option_id)
                INNER JOIN product p USING(product_id)
                WHERE product_feature_id = $product_feature_id AND $where_products_0");
            $min_value = $data["min_value"];
            $max_value = $data["max_value"];

            $options = "";
            $physical_measure_data = def(getPhysicalMeasures(), $product_feature["physical_measure"]);
            if (!$physical_measure_data) {
                continue;
            }

            foreach ($physical_measure_data["units"] as $unit) {
                $factor = $unit["factor"];
                $name = $unit["name"];
                $options .= "<option value=\"$factor\">$name</option>";
            }

            if ($product_feature["data_type"] === "double_value") {
                $options_html = <<<HTML
                $min_value - $max_value
                <div class="flex_children_width">
                    <div class="flex_column" style="margin-right:var(--form_spacing);">
                        Od
                        <div class="glue_children">
                            <input class="field inline" inputmode="numeric">
                            <select class="field inline blank unit_picker">
                                $options
                            </select>
                        </div>
                    </div>
                    <div class="flex_column">
                        Do
                        <div class="glue_children">
                            <input class="field inline" inputmode="numeric">
                            <select class="field inline blank unit_picker">
                                $options
                            </select>
                        </div>
                    </div>
                </div>
HTML;
            }
        }
        if ($options_html) {
            $html .= "<li class=\"feature_row\">";
            $html .= "<span class=\"feature_label\">" . $product_feature["name"] . "</span>";
            $html .= $options_html;
            $html .= "</li>";
        }
    }
    $html .= "</ul>";
    return $html;
}

$products_search_data = getGlobalProductsSearch([
    "datatable_params" => json_encode(["page_id" => $page_id, "row_count" => $row_count, "filters" => []]),
    "product_category_id" => $product_category_id,
    "option_id_groups" => json_encode($selected_option_groups),
]);

$products_search_data_0 = getGlobalProductsSearch([
    "datatable_params" => json_encode(["page_id" => 0, "row_count" => 0, "filters" => []]),
    "product_category_id" => $product_category_id,
    "option_id_groups" => "[]",
    "return_all_ids" => true,
]);

$products_ids_csv = implode(",", $products_search_data_0["all_ids"]);
$where_products_0 = $products_ids_csv ? "product_id IN ($products_ids_csv)" : "1";
$where_general_products_0 = "general_product_id IN (SELECT DISTINCT general_product_id FROM product WHERE $where_products_0)";

$options_data = DB::fetchArr("SELECT COUNT(1) count, product_feature_option_id option_id
    FROM general_product
    INNER JOIN general_product_to_feature_option gptfo USING(general_product_id)
    WHERE $where_general_products_0
    GROUP BY product_feature_option_id");

$prices_data = DB::fetchRow("SELECT MIN(gross_price) min_gross_price, MAX(gross_price) max_gross_price
    FROM general_product
    INNER JOIN product USING(general_product_id)
    WHERE $where_products_0");

$option_count = [];
foreach ($options_data as $option_data) {
    $option_count[$option_data["option_id"]] = $option_data["count"];
}

?>

<?php startSection("head_content"); ?>

<link rel="canonical" href="<?= SITE_URL . getProductCategoryLink(json_decode($product_category_data["__category_path_json"], true)) ?>" />

<script>
    const product_category_id = <?= $product_category_id ?>;
    const product_category_path = <?= $product_category_data["__category_path_json"] ?>;
    const prices_data = <?= json_encode($prices_data) ?>;
</script>

<?php startSection("body_content"); ?>

<div class="products_all">
    <div class="searching_wrapper">
        <div class="scroll_panel scroll_shadow">
            <div>
                <div class="search_header first"> <i class="fas fa-bars"></i> Kategorie </div>
                <div class="product_categories">
                    <?= traverseCategories() ?>
                </div>

                <div class="search_header"> <i class="fas fa-star"></i> Cechy </div>
                <div class="product_features">
                    <?= traverseFeatures() ?>
                </div>

                <div class="search_header"> <i class="fas fa-tags"></i> Cena <span style="font-weight:400">(<?= $prices_data["min_gross_price"] . " zł - " . $prices_data["max_gross_price"] . " zł" ?>)</span> </div>
                <div class="flex_children_width">
                    <div class="flex_column" style="margin-right:var(--form_spacing);">
                        Od
                        <div class="float_icon flex">
                            <input class="field inline price_min" inputmode="numeric">
                            <i>zł</i>
                        </div>
                    </div>
                    <div class="flex_column">
                        Do
                        <div class="float_icon flex">
                            <input class="field inline price_max" inputmode="numeric">
                            <i>zł</i>
                        </div>
                    </div>
                </div>

                <!-- <select class="field select_price_range" style="margin-top:var(--form_spacing);">
                    <option value="">- Wybierz zakres z listy -</option>
                    <?php
                    $cute_numbers = [0, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
                    $len = count($cute_numbers);
                    for ($i = 0; $i < $len - 1; $i++) {
                        $num_1 = $cute_numbers[$i];
                        $num_2 = $cute_numbers[$i + 1];
                        if ($num_2 >= $prices_data["min_gross_price"] && $num_1 <= $prices_data["max_gross_price"]) {
                            echo "<option value=\"$num_1-$num_2\">$num_1 zł - $num_2 zł</option>";
                        }
                    }
                    ?>
                </select> -->

                <!-- <div class="search_header">
                    <i class="fas fa-search"></i>
                    Szukaj
                    <button class='btn subtle case_search small' onclick='clearSearch()' data-tooltip='Wyczyść filtr' data-tooltip_position='right' style='margin:-10px 0'>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class='float_icon  search_wrapper glue_children'>
                    <input type="text" placeholder="Nazwa produktu..." class="field products_search ignore-glue" onchange="productsSearchChange(this)">
                    <i class="fas fa-search"></i>
                    <button class="btn primary case_mobile search-btn can-disappear">
                        <img class="search_icon" src="/src/img/search_icon.svg">
                    </button>
                </div> -->

                <!-- <div class="sorting-wrapper">
                    <div class="search_header">
                        <i class="fas fa-sort-amount-down-alt"></i>
                        Sortuj
                    </div>
                    <label class="order_by_item">
                        <input type="radio" name="order_by" value="sale" class="sale_option">
                        <span><i class="fas fa-star"></i> Bestsellery</span>
                    </label>
                    <label class="order_by_item">
                        <input type="radio" name="order_by" value="new">
                        <span><i class="fas fa-plus-circle"></i> Najnowsze</span>
                    </label>
                    <label class="order_by_item">
                        <input type="radio" name="order_by" value="cheap">
                        <span><i class="fas fa-dollar-sign"></i> Najtańsze</span>
                    </label>
                    <label class="order_by_item case_no_search">
                        <input type="radio" name="order_by" value="random" class="random_option">
                        <span><i class="fas fa-dice-three"></i> Losowo</span>
                    </label>
                    <label class="order_by_item case_search">
                        <input type="radio" name="order_by" value="relevance" class="relevance_option">
                        <span><img src="/src/img/target_icon.svg" style="width: 1em;transform: translateY(2px);"> Trafność</span>
                    </label>
                </div> -->
            </div>
        </div>
    </div>

    <div class="product_list_wrapper">
        <h1 class="h1 category_name">
            <?php
            $cats_so_far = [];
            $cats = json_decode($product_category_data["__category_path_json"], true);
            $len = count($cats);
            for ($i = 0; $i < $len; $i++) {
                $cat = $cats[$i];
                $cats_so_far[] = $cat;
                if ($i === $len - 1) {
                    echo "<span>" . $cat["name"] . "</span>";
                } else {
                    echo "<a href=\"" . getProductCategoryLink($cats_so_far) . "\">" . $cat["name"] . "<i class=\"fas fa-chevron-right\"></i></a>";
                }
            }
            ?></h1>
        <p class="filters_description"></p>

        <div class="results_info">
            <span>
                Znaleziono wyników:
                <span class="products_total_rows"><?= $products_search_data["total_rows"] ?></span>
            </span>
            <button class="btn primary">Pokaż <i class="fas fa-angle-double-down"></i></button>
        </div>

        <div class="product_list">
            <?= $products_search_data["html"] ?>
        </div>

        <pagination-comp class="product_list_pagination"></pagination-comp>
    </div>
</div>

<?php include "bundles/global/templates/default.php"; ?>