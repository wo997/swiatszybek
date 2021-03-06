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

function traverseCategories($parent_id = -1, $level = 0)
{
    $categories = DB::fetchArr("SELECT product_category_id, name, __category_path_json, __product_count FROM product_category WHERE parent_product_category_id = $parent_id ORDER BY pos ASC");
    if (!$categories) {
        return "";
    }
    $html = "<ul class=\"level_$level\">";
    foreach ($categories as $category) {
        $html .= "<li data-category_id=\"" . $category["product_category_id"] . "\" >";
        $html .= "<a href=\"" . getProductCategoryLink(json_decode($category["__category_path_json"], true)) . "\">" . $category["name"] . "</a>";
        $html .= " <span class=\"count\">(" . $category["__product_count"] . ")</span>";
        $html .= traverseCategories($category["product_category_id"], $level + 1);
        $html .= "</li>";
    }
    $html .= "</ul>";
    return $html;
}

function traverseFeatureOptions($feature_id, $parent_feature_option_id = -1, $level = 0)
{
    $where = "parent_product_feature_option_id = $parent_feature_option_id";
    if ($parent_feature_option_id === -1) {
        $where .= " AND product_feature_id = $feature_id";
    }
    $product_feature_options = DB::fetchArr("SELECT product_feature_option_id, name FROM product_feature_option WHERE $where ORDER BY pos ASC");
    if (!$product_feature_options) {
        return "";
    }
    $html = "<ul class=\"level_$level\">";
    foreach ($product_feature_options as $product_feature_option) {
        $html .= "<li class=\"option_row\">";
        $html .= "<div class=\"checkbox_area\">";
        $html .= "<p-checkbox class=\"square inline option_checkbox\" data-option_id=" . $product_feature_option["product_feature_option_id"] . "></p-checkbox>";
        $html .= " <span class=\"feature_option_label\">" . $product_feature_option["name"] . "</span>";
        $html .= " <span class=\"count\"></span>";
        $html .= "</div> ";
        $html .= traverseFeatureOptions($feature_id, $product_feature_option["product_feature_option_id"], $level + 1);
        $html .= "</li>";
    }
    $html .= "</ul>";
    return $html;
}

function traverseFeatures()
{
    $product_features = DB::fetchArr("SELECT product_feature_id, name FROM product_feature ORDER BY pos ASC");
    if (!$product_features) {
        return "";
    }
    $html = "<ul>";
    foreach ($product_features as $product_feature) {
        $options_html = traverseFeatureOptions($product_feature["product_feature_id"]);
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

?>


<?php startSection("head_content"); ?>

<script>
    <?php $products_search_data = getGlobalProductsSearch([
        "datatable_params" => "[]",
        "product_category_id" => $product_category_id,
        "option_id_groups" => json_encode($selected_option_groups),
    ]); ?>
    const preload_options_data = <?= json_encode($products_search_data["options_data"]) ?>;
    const product_category_id = <?= $product_category_id ?>;
    const product_category_path = <?= $product_category_data["__category_path_json"] ?>;
</script>

<?php startSection("body_content"); ?>

<div class="products_all">
    <div class="searching_wrapper">
        <button class="btn primary fill mobile_search_btn" onclick="showModal('searchCategory', {source:this})">
            <i class="fas fa-list"></i> Kategorie
        </button>

        <button class="btn primary fill mobile_search_btn search-filters-btn" onclick="beforeFiltersShown();showModal('searchFilters', {source:this})">
            <i class="fas fa-sliders-h"></i> Filtry <span class="filter_count"></span>
        </button>

        <div class="search_header"><i class="fas fa-list"></i> Kategorie</div>

        <div class="product_categories">
            <?= traverseCategories() ?>
        </div>

        <div class="product_features">
            <?= traverseFeatures() ?>
        </div>

        <div class="search_header">
            <i class="fas fa-search"></i>
            Szukaj
            <button class='btn subtle case_search small' onclick='clearSearch()' data-tooltip='Wyczyść filtr' data-tooltip_position='right' style='margin:-10px 0'>
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class='float-icon mobile-margin-bottom search_wrapper glue_children'>
            <input type="text" placeholder="Nazwa produktu..." class="field products_search ignore-glue" onchange="productsSearchChange(this)">
            <i class="fas fa-search"></i>
            <button class="btn primary case_mobile search-btn can-disappear">
                <img class="search_icon" src="/src/ img/search_icon.svg">
            </button>
        </div>

        <div class="sorting-wrapper">
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
        </div>

        <div class="filters" data-form>
            <div class='search_header'>
                <i class='fas fa-sliders-h'></i>
                Filtry
                <span class='filter_count'></span>
                <button class='btn subtle case_any_filters' onclick='clearAllFilters()' data-tooltip='Wyczyść filtry' data-tooltip_position='right' style='margin:-10px 0'>
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class='attribute-header'>Cena <span class="price_range_info"></span></div>

            <div class="flex-children-width">
                <div class="flex-column" style="margin-right:15px;">
                    Min.
                    <div class='float-icon mobile-margin-bottom flex'>
                        <input type="number" class="field inline price_min_search no-wrap" name="price_min_search" style="padding-right: 24px;" oninput="filterChange()" onchange="filterChange(true);">
                        <i>zł</i>
                    </div>
                </div>
                <div class="flex-column">
                    Max.
                    <div class='float-icon mobile-margin-bottom flex'>
                        <input type="number" class="field inline price_max_search no-wrap" name="price_max_search" style="padding-right: 24px;" oninput="filterChange()" onchange="filterChange(true);">
                        <i>zł</i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="product_list_wrapper">
        <div style="margin: 40px 0">
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
        </div>
        <?= ""; //$product_category["description"] 
        ?>

        <div class="hook_view"></div>

        <div class="product_list">
            <?= $products_search_data["html"] ?>
        </div>

        <!-- <div class="under-products">
            <div class="flexbar">
                <div class="pagination"></div>
            </div>

            <?= ""; //getCMSPageHTML($product_category["content"]) 
            ?>
        </div> -->
    </div>
</div>

<?php include "bundles/global/templates/default.php"; ?>