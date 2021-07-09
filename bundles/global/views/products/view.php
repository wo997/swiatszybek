<?php //route[/produkty]

$product_category_data = null;

$default_category_data = [
    "product_category_id" => -1, "name" => "Wszystkie produkty", "__category_path_json" => json_encode([["id" => -1, "name" => "Wszystkie produkty"]]), "__product_count" => 0
];

$product_category_id = Request::urlParam(1, -1);
if ($product_category_id !== -1) {
    $product_category_id = intval($product_category_id);
    $product_category_data = DB::fetchRow("SELECT name, __category_path_json, __url FROM product_category WHERE product_category_id = $product_category_id");
    if (!$product_category_data) {
        Request::notFound();
    }

    $category_link_base = explode("?", $product_category_data["__url"])[0];
    if ($category_link_base !== Request::$url) {
        $true_category_link = $category_link_base;
        if ($_GET) {
            $true_category_link .= "?" . http_build_query($_GET);
        }
        Request::redirectPermanent($true_category_link);
    }
} else {
    $product_category_data = $default_category_data;
}

$category_path = json_decode($product_category_data["__category_path_json"], true);
$all_category_ids = array_column($category_path, "id");
$all_category_names = array_column($category_path, "name");

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
    global $option_count_map, $option_ids_desc_csv;

    $where = "parent_product_feature_option_id = $parent_feature_option_id";
    if ($parent_feature_option_id === -1) {
        $where .= " AND product_feature_id = $feature_id";
    }
    //$product_feature_options = DB::fetchArr("SELECT product_feature_option_id, value, extra_json FROM product_feature_option WHERE $where ORDER BY pos ASC");
    if (!$option_ids_desc_csv) {
        return "";
    }
    $product_feature_options = DB::fetchArr("SELECT product_feature_option_id, value, extra_json FROM product_feature_option WHERE $where ORDER BY FIELD(product_feature_option_id,$option_ids_desc_csv) DESC");
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
        $count = def($option_count_map, $id, 0);

        if ($count) {
            $display = true;
        }

        $checkbox_style = "";

        $show_before = "";
        if ($feature_extra === "color") {
            $extra = json_decode($option["extra_json"], true);
            if ($extra) {
                $color = def($extra, "color", "");
            }
            if (!$color) {
                $color = "#ffffff";
            }
            $checkbox_style = "--checkbox_color:$color";
        }

        //$checkbox_style = "";

        $classes = "option_row";
        if (!$count) {
            // hide unnecessary options cause there were just too many of these
            continue;
            $classes .= " empty";
        }

        $html .= "<li class=\"$classes\">";
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
    global $where_products_0, $feature_general_product_count_map, $general_product_ids;

    $product_features = DB::fetchArr("SELECT product_feature_id, name, data_type, physical_measure, list_type, extra, units_json FROM product_feature ORDER BY pos ASC");
    if (!$product_features) {
        return "";
    }
    $html = "";

    array_unshift($product_features, [
        "product_feature_id" => "cena",
        "name" => "Cena",
        "data_type" => "double_value",
        "physical_measure" => "price",
        "list_type" => "",
        "extra" => "[]",
        "units_json" => "[]"
    ]);

    $general_products_count = count($general_product_ids);

    foreach ($product_features as $product_feature) {
        $product_feature_id = $product_feature["product_feature_id"];
        $is_cena = $product_feature_id === "cena";

        $general_product_count = def($feature_general_product_count_map, $product_feature_id, 0);
        // if (User::getCurrent()->priveleges["backend_access"]) {
        //     var_dump();
        // }

        if (!$is_cena && $general_product_count / $general_products_count < 0.3) {
            continue;
        }

        $feature_body = "";
        $feature_label = $product_feature["name"];

        if (endsWith($product_feature["data_type"], "_list")) {
            $feature_body = traverseFeatureOptions($product_feature_id, $product_feature["list_type"], $product_feature["extra"]);

            if (!$feature_body) {
                continue;
            }
        } else {
            if ($product_feature["data_type"] === "double_value") {
                if ($is_cena) {
                    $double_values = DB::fetchArr("SELECT p.gross_price as v, JSON_ARRAYAGG(product_id) as i FROM product p
                        WHERE $where_products_0 GROUP BY p.gross_price ORDER BY p.gross_price DESC");
                } else {
                    $double_values = DB::fetchArr("SELECT pfo.double_value as v, JSON_ARRAYAGG(product_id) as i FROM product p
                        INNER JOIN product_to_variant_option ptvo USING(product_id)
                        INNER JOIN product_variant_option_to_feature_option pvotfo USING (product_variant_option_id)
                        INNER JOIN product_feature_option pfo USING(product_feature_option_id)
                        WHERE pfo.product_feature_id = $product_feature_id AND $where_products_0 GROUP BY pfo.double_value ORDER BY pfo.double_value DESC");
                }

                // $time = microtime(true);
                // $double_values = array_merge($double_values, $double_values);
                // $double_values = array_merge($double_values, $double_values);
                // $double_values = array_merge($double_values, $double_values);
                // $double_values = array_merge($double_values, $double_values);
                // $double_values = array_merge($double_values, $double_values);
                // $double_values = array_merge($double_values, $double_values);
                // $double_values = array_merge($double_values, $double_values);
                // $double_values = array_merge($double_values, $double_values);
                // var_dump("TIME ON " . count($double_values) . ": " . ((microtime(true) - $time) * 1000) . "<br>\n");

                $first_value = def($double_values, 0, null);
                $last_value = def($double_values, count($double_values) - 1, null);
                $min_value = $last_value ? $last_value["v"] : 0;
                $max_value = $first_value ? $first_value["v"] : 0;

                if ($min_value === $max_value) {
                    continue;
                }

                $physical_measure = $product_feature["physical_measure"];

                $units = json_decode($product_feature["units_json"], true);
                $unit_ids = $units ? array_column($units, "id") : [];

                $physical_measure_data = def(getPhysicalMeasures(), $physical_measure);

                if ($physical_measure_data) {
                    if ($unit_ids) {
                        $units = array_values(array_filter($physical_measure_data["units"], fn ($u) => in_array($u["id"], $unit_ids)));
                    } else {
                        $units = $physical_measure_data["units"];
                    }
                } else {
                    $units = [];
                }

                $pretty_min = prettyPrintPhysicalMeasure($min_value, $units);
                $pretty_max = prettyPrintPhysicalMeasure($max_value, $units);

                $feature_label .= " ($pretty_min[value] $pretty_min[unit_name] - $pretty_max[value] $pretty_max[unit_name])";

                $feature_key = $is_cena ? "cena" : "r$product_feature_id";
                $quick_list_html =  "<ul data-feature_key=\"$feature_key\" class=\"double_value_quick_list\">";

                setRangesFromLongDatasetWithIndices($double_values, 8);

                $unit_map = [];

                $add_unit = function (&$unit_map, $unit_id) {
                    if (!isset($unit_map[$unit_id])) {
                        $unit_map[$unit_id] = 0;
                    }
                    $unit_map[$unit_id]++;
                };

                foreach ($double_values as $double_value) {
                    $value = $double_value["v"];
                    $max = def($double_value, "max", 0);
                    $count = $double_value["c"];
                    $pretty_val_data = prettyPrintPhysicalMeasure($value, $units);
                    $pretty_val = "$pretty_val_data[value] $pretty_val_data[unit_name]";
                    $search_value = "$pretty_val_data[value]$pretty_val_data[unit_id]";
                    $add_unit($unit_map, $pretty_val_data["unit_id"]);
                    if ($max) {
                        $max_pretty_val_data = prettyPrintPhysicalMeasure($max, $units);
                        $pretty_val .= " - $max_pretty_val_data[value] $max_pretty_val_data[unit_name]";
                        $search_value .= "_do_$max_pretty_val_data[value]$max_pretty_val_data[unit_id]";
                        $add_unit($unit_map, $max_pretty_val_data["unit_id"]);
                    }

                    $quick_list_html .= "<li class=\"option_row\">";
                    $quick_list_html .= "<div class=\"checkbox_area\">";
                    $quick_list_html .= "<p-checkbox class=\"inline square black_light option_range_checkbox\" data-value=\"$search_value\"></p-checkbox>";
                    $quick_list_html .= " <span class=\"feature_option_label\">$pretty_val</span>";
                    $quick_list_html .= " <span class=\"count\">($count)</span>";
                    $quick_list_html .= "</div> ";
                    $quick_list_html .= "</li>";
                }
                $quick_list_html .= "</ul>";

                $most_unit_id = "";
                $most_unit_cnt = 0;
                foreach ($unit_map as $unit_id => $unit_cnt) {
                    if ($unit_cnt > $most_unit_cnt) {
                        $most_unit_cnt = $unit_cnt;
                        $most_unit_id = $unit_id;
                    }
                }

                if ($units) {
                    $options = "";
                    $unit_count = count($units);
                    for ($i = 0; $i < $unit_count; $i++) {
                        $unit = $units[$i];
                        $multiply = $unit["multiply"];
                        $unit_id = $unit["id"];
                        $name = $unit["name"];

                        $selected = $unit_id === $most_unit_id ? "selected" : "";

                        if ($max_value + 0.000001 < $multiply) {
                            continue;
                        }

                        $next_unit = def($units, $i + 1, null);
                        if ($next_unit && $next_unit["multiply"] + 0.000001 < $min_value) {
                            continue;
                        }

                        $options .= "<option value=\"$unit_id\" $selected>$name</option>";
                    }

                    $from_select = "<select class=\"field inline blank unit_picker from\">$options</select>";
                    $to_select = "<select class=\"field inline blank unit_picker to\">$options</select>";
                } else {
                    $from_select = "";
                    $to_select = "";
                }

                $feature_body .= <<<HTML
                    <div class="tab_menu">
                        <div class="tab_header glue_children" style="margin-bottom:7px;">
                            <div class="tab_option current" data-tab_id="1">
                                Lista
                            </div>
                            <div class="tab_option" data-tab_id="2">
                                Przedział
                            </div>
                        </div>
                        <div class="tab_content expand_y" data-tab_id="1">
                            $quick_list_html
                        </div>
                        <div class="tab_content animate_hidden hidden expand_y" data-tab_id="2">
                            <div class="flex_children_width range_filter" data-feature_key="$feature_key">
                                <div class="flex_column mrf">
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
                        </div>
                    </div>
HTML;
            } else {
                //var_dump($product_feature);
                //echo "need to add filter html";
                continue;
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

$products_search_data_0 = getGlobalProductsSearch(getProductCategoryLink($category_path));

$products_ids_csv = implode(",", $products_search_data_0["all_ids"]);
$where_products_0 = $products_ids_csv ? "product_id IN ($products_ids_csv)" : "-1";

$general_product_ids = DB::fetchCol("SELECT DISTINCT general_product_id
    FROM product
    WHERE $where_products_0 AND general_product_id IS NOT NULL");

$general_products_ids_csv = implode(",", $general_product_ids);
$where_general_products_0 = $general_products_ids_csv ? "general_product_id IN ($general_products_ids_csv)" : "-1";

$options_data = DB::fetchArr("SELECT COUNT(DISTINCT product_id) count, pfo.product_feature_option_id option_id
    FROM product p
    INNER JOIN product_to_variant_option ptvo USING(product_id)
    INNER JOIN product_variant_option_to_feature_option pvotfo USING(product_variant_option_id)
    INNER JOIN product_feature_option pfo USING (product_feature_option_id)
    WHERE $where_products_0
    GROUP BY pfo.product_feature_option_id");

// usort($options_data, fn ($a, $b) => $b["count"] <=> $a["count"]);

$prices_data = DB::fetchRow("SELECT MIN(gross_price) min_gross_price, MAX(gross_price) max_gross_price
    FROM general_product
    INNER JOIN product USING(general_product_id)
    WHERE $where_products_0");

$option_count_map = [];
$option_ids_desc = [];
foreach ($options_data as $option_data) {
    $option_count_map[$option_data["option_id"]] = $option_data["count"];
    $option_ids_desc[] = $option_data["option_id"];
}
$option_ids_desc_csv = join(",", array_reverse($option_ids_desc));

$feature_general_product_count = DB::fetchArr("SELECT product_feature_id id, COUNT(DISTINCT general_product_id) count
    FROM general_product_to_feature
    WHERE $where_general_products_0
    GROUP BY product_feature_id");

$feature_general_product_count_map = [];
foreach ($feature_general_product_count as $x) {
    $feature_general_product_count_map[$x["id"]] = $x["count"];
}

//var_dump("TIME" . ((microtime(true) - $time) * 1000) . "<br>\n");



?>

<?php Templates::startSection("head"); ?>

<link rel="canonical" href="<?= SITE_URL . getProductCategoryLink($category_path) ?>" />

<title><?= join(" | ", $all_category_names) ?> - <?= getShopName() ?></title>

<script>
    const product_category_id = <?= $product_category_id ?>;
    const product_category_path = <?= $product_category_data["__category_path_json"] ?>;
    const prices_data = <?= json_encode($prices_data) ?>;
    const products_total_rows = <?= $products_search_data["total_rows"] ?>;
</script>

<?php Templates::startSection("body_content"); ?>

<div class="products_all">
    <div class="mobile_searching">
        <button class="btn transparent categories_btn">Kategorie <i class="fas fa-list"></i></button>
        <div class="separator"></div>
        <button class="btn transparent filters_btn">Filtry<span class="product_filter_count"></span> <i class="fas fa-sliders-h"></i></button>
    </div>
    <div class="searching_wrapper separate_scroll">
        <div class="scroll_panel scroll_shadow">
            <div>
                <div class="search_header first"> <span>Kategorie</span> </div>
                <div class="product_categories">
                    <?= traverseCategories() ?>
                </div>
                <div class="prcbf"></div>

                <div class="search_header">
                    <span>Filtry</span>
                    <span class="feature_filter_count"></span>
                    <button class="btn transparent small clear_filters_btn" data-tooltip="Wyczyść filtry" data-tooltip_position="right"> <i class="fas fa-eraser" style="transform: scale(1.25);"></i></button>
                </div>
                <ul class="product_filters">
                    <div class="label"> <span>Wyszukaj po frazie</span> </div>
                    <div class="float_icon">
                        <input class="field search_phrase" placeholder="Nazwa produktu">
                        <i class="fas fa-search"></i>
                    </div>
                    <div class="label">
                        Wyświetl
                    </div>
                    <div class="checkbox_area mt1">
                        <p-checkbox class="square only_discount"></p-checkbox>
                        <span>Tylko<span class="semi_bold" style="color:var(--clr_buynow)"> PROMOCJE</span></span>
                    </div>
                    <div class="checkbox_area mt1">
                        <p-checkbox class="square only_in_stock"></p-checkbox>
                        <span>Tylko dostępne</span>
                    </div>

                    <?= traverseFeatures() ?>
                </ul>
                <div class="prfbf"></div>
            </div>
        </div>
    </div>

    <div class="product_list_wrapper">
        <div class="product_list_wrapper_top">
            <h1 class="h1 category_name">
                <?php
                $cats_so_far = [];
                $len = count($category_path);
                for ($i = 0; $i < $len; $i++) {
                    $cat = $category_path[$i];
                    $cats_so_far[] = $cat;
                    if ($i === $len - 1) {
                        echo "<span>" . $cat["name"] . "</span>";
                    } else {
                        echo "<a href=\"" . getProductCategoryLink($cats_so_far) . "\">" . $cat["name"] . "<i class=\"fas fa-chevron-right\"></i></a>";
                    }
                }
                ?></h1>
            <!-- <p class="filters_description"></p> -->

            <div class="results_info">
                Znaleziono wyników:
                <div class="spinner_wrapper inline prod_search_spinner_wrapper" style="margin-left:1px">
                    <span class="products_total_rows"><?= $products_search_data["total_products"] ?></span>
                    <div class="spinner overlay"></div>
                </div>
            </div>

            <div class="sorting_wrapper">
                <span class="semi_bold mr2">Sortuj</span>
                <select class="field inline search_order">
                    <option value="bestsellery">Bestsellery</option>
                    <option value="najnowsze">Najnowsze</option>
                    <option value="ceny-rosnaco">Ceny rosnąco</option>
                    <option value="ceny-malejaco">Ceny malejąco</option>
                </select>
                <input class="case_search field inline" value="Trafność" readonly style="width: 82px;pointer-events:none">
            </div>
        </div>

        <div class="product_list"><?= $products_search_data["html"] ?></div>

        <pagination-comp class="product_list_pagination"></pagination-comp>

        <div style="height:200px"></div>
    </div>
</div>

<div id="products_Categories" data-modal data-dismissable data-expand>
    <div class="modal_body">
        <button class="close_modal_btn"><i class="fas fa-times"></i></button>
        <h3 class="modal_header">Kategorie</h3>
        <div class="scroll_panel scroll_shadow">
            <hr>
        </div>
    </div>
</div>

<div id="products_Filters" data-modal data-dismissable data-expand>
    <div class="modal_body">
        <button class="close_modal_btn"><i class="fas fa-times"></i></button>
        <h3 class="modal_header">Filtry</h3>
        <div class="scroll_panel scroll_shadow panel_padding">
            <hr>
        </div>
        <div class="footer flex pa1">
            <button class="btn subtle fill clear_filters_btn">Wyczyść<span class="product_filter_count"></span></button>
            <button class="btn primary fill ml1" onclick="hideParentModal(this)">
                Pokaż:
                <div class="spinner_wrapper inline prod_search_spinner_wrapper" style="margin-left:1px">
                    <span class="products_total_rows"><?= $products_search_data["total_products"] ?></span>
                    <div class="spinner overlay white"></div>
                </div>

            </button>


        </div>
    </div>
</div>

<?php include "bundles/global/templates/default.php"; ?>