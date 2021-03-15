<?php //route[/produkty]

$product_category_data = null;

$default_category_data = [
    "product_category_id" => -1, "name" => "Wszystkie produkty", "__category_path_json" => json_encode([["id" => -1, "name" => "Wszystkie produkty"]]), "__product_count" => 0
];

$product_category_id = Request::urlParam(1, -1);
if ($product_category_id !== -1) {
    $product_category_id = intval($product_category_id);
    $product_category_data = DB::fetchRow("SELECT name, __category_path_json FROM product_category WHERE product_category_id = $product_category_id");
} else {
    $product_category_data = $default_category_data;
}

$all_category_ids = array_map(fn ($x) => $x["id"], json_decode($product_category_data["__category_path_json"], true));

function traverseCategories($parent_id = -1, $level = 0)
{
    global $default_category_data, $all_category_ids;

    $categories = DB::fetchArr("SELECT product_category_id, name, __category_path_json, __product_count FROM product_category WHERE parent_product_category_id = $parent_id ORDER BY pos ASC");
    if (!$categories) {
        return "";
    }
    $ul_class = "level_$level";
    if ($level > 0) {
        $ul_class .= " expand_y";
        if (!in_array($parent_id, $all_category_ids)) {
            $ul_class .= " hidden animate_hidden";
        }
    }
    $ul_class = trim($ul_class);

    $html = "<ul class=\"$ul_class\">";
    if ($level === 0) {
        array_unshift($categories, $default_category_data);
    }
    foreach ($categories as $category) {
        $id = $category["product_category_id"];
        $name = $category["name"];
        $count = $category["__product_count"];
        $link = getProductCategoryLink(json_decode($category["__category_path_json"], true));

        $html .= "<li data-category_id=\"$id\" >";
        $html .= "<a href=\"$link\">$name";
        if ($count) {
            $html .= " <span class=\"count\">($count)</span>";
        }
        $html .= "</a>";
        if ($id !== -1) {
            $html .= traverseCategories($id, $level + 1);
        }
        $html .= "</li>";
    }
    $html .= "</ul>";
    return $html;
}

function traverseFeatureOptions($feature_id, $list_type, $feature_extra, $parent_feature_option_id = -1, $level = 0)
{
    global $option_count;

    $where = "parent_product_feature_option_id = $parent_feature_option_id";
    if ($parent_feature_option_id === -1) {
        $where .= " AND product_feature_id = $feature_id";
    }
    $product_feature_options = DB::fetchArr("SELECT product_feature_option_id, value, extra_json FROM product_feature_option WHERE $where ORDER BY pos ASC");
    if (!$product_feature_options) {
        return "";
    }

    $ul_class = "level_$level";
    if ($list_type === "single") {
        $ul_class .= " radio_group unselectable";
    }

    $checkbox_class = "inline option_checkbox";
    if ($list_type === "single") {
        $checkbox_class .= " circle";
    } else {
        $checkbox_class .= " square";
    }
    if ($feature_extra === "color") {
        $checkbox_class .= " colorful";
    } else {
        $checkbox_class .= " black_light";
    }


    $html = "<ul class=\"$ul_class\">";
    $display = false;
    foreach ($product_feature_options as $option) {
        $id = $option["product_feature_option_id"];
        $value = $option["value"];
        $count = def($option_count, $id, 0);

        if ($count) {
            $display = true;
        }

        $checkbox_style = "";

        $show_before = "";
        if ($feature_extra === "color") {
            $extra = json_decode($option["extra_json"], true);
            if ($extra) {
                $color = def($extra, "color", "");
                if ($color) {
                    //$show_before = "<div class=\"just_color\" style=\"--color:$color\"></div>";
                    $checkbox_style = "--checkbox_color:#$color";
                }
            }
        }

        //$checkbox_style = "";

        $html .= "<li class=\"option_row\">";
        $html .= "<div class=\"checkbox_area\">";
        $html .= "<p-checkbox class=\"$checkbox_class\" data-value=\"$id\" style=\"$checkbox_style\"></p-checkbox>";
        $html .= " <span class=\"feature_option_label\">$show_before $value</span>";
        $html .= " <span class=\"count\">($count)</span>";
        $html .= "</div> ";
        $html .= traverseFeatureOptions($feature_id, $list_type, $feature_extra, $id, $level + 1);
        $html .= "</li>";
    }
    $html .= "</ul>";
    return $display ? $html : null;
}

function traverseFeatures()
{
    global $where_products_0;

    $product_features = DB::fetchArr("SELECT product_feature_id, name, data_type, physical_measure, list_type, extra FROM product_feature ORDER BY pos ASC");
    if (!$product_features) {
        return "";
    }
    $html = "";
    foreach ($product_features as $product_feature) {
        $product_feature_id = $product_feature["product_feature_id"];

        $feature_body = "";
        $feature_label = $product_feature["name"];

        if (endsWith($product_feature["data_type"], "_list")) {
            $feature_body = traverseFeatureOptions($product_feature_id, $product_feature["list_type"], $product_feature["extra"]);

            if (!$feature_body) {
                continue;
            }
        } else {
            $data = DB::fetchRow("SELECT MIN(double_value) min_value, MAX(double_value) max_value FROM product_feature_option
                INNER JOIN product_to_feature_option ptfo USING(product_feature_option_id)
                INNER JOIN product p USING(product_id)
                WHERE product_feature_id = $product_feature_id AND $where_products_0");
            $min_value = $data["min_value"];
            $max_value = $data["max_value"];

            if ($min_value === $max_value) {
                continue;
            }

            $physical_measure = $product_feature["physical_measure"];

            $pretty_min = prettyPrintPhysicalMeasure($min_value, $physical_measure);
            $pretty_max = prettyPrintPhysicalMeasure($max_value, $physical_measure);

            $feature_label .= " ($pretty_min - $pretty_max)";

            $physical_measure_data = def(getPhysicalMeasures(), $physical_measure);
            if ($physical_measure_data) {
                $options = "";
                $units = $physical_measure_data["units"];
                $unit_count = count($units);
                for ($i = 0; $i < $unit_count; $i++) {
                    $unit = $units[$i];
                    $factor = $unit["factor"];
                    $name = $unit["name"];

                    if ($max_value + 0.000001 < $factor) {
                        continue;
                    }

                    $next_unit = def($units, $i + 1, null);
                    if ($next_unit && $next_unit["factor"] + 0.000001 < $min_value) {
                        continue;
                    }

                    $options .= "<option value=\"$factor\">$name</option>";
                }

                $from_select = "<select class=\"field inline blank unit_picker from\">$options</select>";
                $to_select = "<select class=\"field inline blank unit_picker to\">$options</select>";
            } else {
                $from_select = "";
                $to_select = "";
            }

            if ($product_feature["data_type"] === "double_value") {
                $feature_body = <<<HTML
                <div class="flex_children_width range_filter" data-product_feature_id="$product_feature_id">
                    <div class="flex_column" style="margin-right:var(--form_spacing);">
                        Od
                        <div class="glue_children">
                            <input class="field inline from" inputmode="numeric">
                            $from_select
                        </div>
                    </div>
                    <div class="flex_column">
                        Do
                        <div class="glue_children">
                            <input class="field inline to" inputmode="numeric">
                            $to_select
                        </div>
                    </div>
                </div>
HTML;
            } else {
                echo "missing html !!!";
            }
        }

        $html .= "<li class=\"feature_row\">";
        $html .= "<span class=\"feature_label\">$feature_label</span>";
        $html .= $feature_body;
        $html .= "</li>";
    }
    return $html;
}

$products_search_data = getGlobalProductsSearch(Request::$full_url);

$products_search_data_0 = getGlobalProductsSearch(
    getProductCategoryLink(json_decode($product_category_data["__category_path_json"], true)),
    ["return_all_ids" => true]
);

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
                <div class="search_header first"> <span>Kategorie</span> </div>
                <div class="product_categories">
                    <?= traverseCategories() ?>
                </div>

                <div class="label"> <span>Wyszukaj po frazie</span> </div>
                <input type="text" class="field search_phrase" placeholder="Nazwa produktu">

                <div class="search_header">
                    <span>Cechy</span>
                    <span class="feature_filter_count"></span>
                    <button class="btn transparent small clear_filters_btn" data-tooltip="Wyczyść filtry" data-tooltip_position="right"> <i class="fas fa-eraser" style="transform: scale(1.25);"></i></button>
                </div>
                <ul class="product_features">
                    <?= traverseFeatures() ?>

                    <li class="feature_row">
                        <span class="feature_label">Cena (<?= $prices_data["min_gross_price"] . " zł - " . $prices_data["max_gross_price"] . " zł" ?>)</span>
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
                    </li>
                </ul>

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
                <div style="position:relative;display:inline-block; margin-left:3px">
                    <span class="products_total_rows"><?= $products_search_data["total_rows"] ?></span>
                    <div class="spinner overlay"></div>
                </div>
            </span>
            <button class="btn primary">Pokaż <i class="fas fa-angle-double-down"></i></button>
        </div>

        <div class="product_list"><?= $products_search_data["html"] ?></div>

        <pagination-comp class="product_list_pagination"></pagination-comp>
    </div>
</div>

<?php include "bundles/global/templates/default.php"; ?>