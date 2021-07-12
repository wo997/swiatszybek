<?php //hook[helper]

function getGlobalProductsSearch($url)
{
    // setup search vars

    $url_data = parse_url($url);
    $url_vars = explode("/", trim($url_data["path"], "/"));
    parse_str(def($url_data, "query", ""), $get_vars);

    $product_category_id = intval(def($url_vars, 1, -1));

    $page_id = intval(def($get_vars, "str", 1)) - 1;
    $row_count = intval(def($get_vars, "ile", 25));

    $search_phrase = def($get_vars, "znajdz", "");
    $search_order = def($get_vars, "sortuj", "bestsellery");

    $only_discount = def($get_vars, "promocje", "0");
    $only_in_stock = def($get_vars, "dostepne", "0");

    // do the search for product_ids iteratively, not with a big query that would quickly slow down

    // categories usually filter the most effectively, thus they are first in the query

    $from = "product p INNER JOIN general_product gp USING (general_product_id)";
    $where = "p.active AND gp.active";
    if ($product_category_id !== -1) {
        $from .= " INNER JOIN general_product_to_category gptc USING (general_product_id)";
        $where .= " AND gptc.product_category_id = $product_category_id";
    }

    $product_ids = DB::fetchCol("SELECT product_id FROM $from WHERE $where GROUP BY product_id");

    // then feature options
    // FROM NOW REMEMBER TO ADD PRODUCT_IDS TO THE QUERY
    foreach (explode("-", def($get_vars, "v", "")) as $option_ids_str) {
        if (!$option_ids_str) {
            continue;
        }

        $option_ids = array_map(fn ($x) => intval($x), explode("i", $option_ids_str));
        $option_ids_csv = clean(implode(",", $option_ids));
        if (!$option_ids_csv) {
            continue;
        }

        $product_ids_csv = $product_ids ? join(",", $product_ids) : "-1";

        $product_ids = DB::fetchCol("SELECT product_id
            FROM general_product gp
            INNER JOIN product p USING (general_product_id)
            INNER JOIN product_to_variant_option ptvo USING(product_id)
            INNER JOIN product_variant_option_to_feature_option pvotfo USING(product_variant_option_id)
            INNER JOIN general_product_to_feature_option gptfo USING(general_product_id)
            WHERE p.product_id IN ($product_ids_csv) AND pvotfo.product_feature_option_id IN ($option_ids_csv)
            GROUP BY product_id");
    }

    // then ranges
    foreach ($get_vars as $product_feature_id => $range_str) {
        if (!preg_match('/^(r\d*|cena)$/', $product_feature_id)) {
            continue;
        }

        $val_parts = explode("_do_", $range_str);

        $min = def($val_parts, 0, "");
        $max = strpos($range_str, "_do_") === false ? $min : def($val_parts, 1, "");

        if ($min === "" && $max === "") {
            continue;
        }

        $is_cena = $product_feature_id === "cena";
        if (!$is_cena) {
            $product_feature_id = numberFromStr($product_feature_id);
        }

        $product_ids_csv = $product_ids ? join(",", $product_ids) : "-1";

        $from = "general_product gp INNER JOIN product p USING (general_product_id)";
        $where = "p.product_id IN ($product_ids_csv)";

        if (!$is_cena) {
            // for both min and max, thus on top
            $from .= "
                INNER JOIN product_to_variant_option ptvo USING (product_id)
                INNER JOIN product_variant_option_to_feature_option pvotfo USING (product_variant_option_id)
                INNER JOIN product_feature_option pfo ON pvotfo.product_feature_option_id = pfo.product_feature_option_id
                INNER JOIN general_product_to_feature_option gptfo USING(general_product_id)
                INNER JOIN product_feature_option gpfo ON pvotfo.product_feature_option_id = gpfo.product_feature_option_id";

            $where .= " AND pfo.product_feature_id = $product_feature_id";
            $where .= " AND gpfo.product_feature_id = $product_feature_id";
        }
        if ($min !== "") {
            preg_match('/[a-zA-Z]/', $min, $matches, PREG_OFFSET_CAPTURE);
            if ($matches) {
                $unit_id = substr($min, $matches[0][1]);
                $unit_data = getPhysicalMeasureUnit($unit_id);
                $double_base =  substr($min, 0, $matches[0][1]);
                $min = ($double_base + def($unit_data, "add", 0)) * $unit_data["multiply"];
            }

            $min -= 0.000001;
            if ($is_cena) {
                $where .= " AND __current_gross_price >= $min";
            } else {
                $where .= " AND pfo.double_value >= $min";
            }
        }
        if ($max !== "") {
            preg_match('/[a-zA-Z]/', $max, $matches, PREG_OFFSET_CAPTURE);
            if ($matches) {
                $unit_id = substr($max, $matches[0][1]);
                $unit_data = getPhysicalMeasureUnit($unit_id);
                $double_base = substr($max, 0, $matches[0][1]);
                $max = ($double_base + def($unit_data, "add", 0)) * $unit_data["multiply"];
            }

            $max += 0.000001;
            if ($is_cena) {
                $where .= " AND __current_gross_price <= $max";
            } else {
                $where .= " AND pfo.double_value <= $max";
            }
        }

        //var_dump("SELECT product_id FROM $from WHERE $where GROUP BY product_id");
        $product_ids = DB::fetchCol("SELECT product_id FROM $from WHERE $where GROUP BY product_id");
    }
    //die;

    // we dont pass it as an argument of renderGeneralProductsList to fetch product_ids count to display
    if ($only_discount) {
        $product_ids_csv = $product_ids ? join(",", $product_ids) : "-1";
        $product_ids = DB::fetchCol("SELECT product_id FROM $from WHERE __discount_percent > 0 AND p.product_id IN ($product_ids_csv)");
    }
    if ($only_in_stock) {
        $product_ids_csv = $product_ids ? join(",", $product_ids) : "-1";
        $product_ids = DB::fetchCol("SELECT product_id FROM $from WHERE stock > 0 AND p.product_id IN ($product_ids_csv)");
    }

    $params = [
        "product_ids" => $product_ids,
        "page_id" => $page_id,
        "row_count" => $row_count,
        "search_order" => $search_order,
        "layout" => "grid"
    ];

    // and text search at the end
    if ($search_phrase) {
        $params["quick_search"] = $search_phrase;
        $params["search_order"] = "relevance";
    }

    $products_data = renderGeneralProductsList($params);
    $products_data["total_products"] = count($product_ids);
    $products_data["all_ids"] = $product_ids;

    return $products_data;
}

function renderGeneralProductsList($params)
{
    global $GENERAL_PRODUCT_ID;

    /** @var DatatableParams */
    $datatable_params = ["page_id" => $params["page_id"], "row_count" => $params["row_count"], "filters" => []];

    $product_ids = def($params, "product_ids", null);
    $general_product_ids = def($params, "general_product_ids", null);
    $layout = def($params, "layout", "slider");

    $skip = def($params, "skip", 0);

    $from = "general_product gp
        INNER JOIN product p USING (general_product_id)
        LEFT JOIN product_to_variant_option ptvo USING(product_id)
        LEFT JOIN product_variant_option pvo USING(product_variant_option_id)
        LEFT JOIN product_variant pv USING(product_variant_id)
        LEFT JOIN product_variant_option_to_feature_option pvotfo USING(product_variant_option_id)";

    $where = "p.active AND gp.active"; // repeats but leave it like this ;)

    if ($product_ids !== null) {
        $where .= " AND p.product_id IN (" . ($product_ids ? join(",", $product_ids) : "-1") . ")";
    } else if ($general_product_ids !== null) {
        $where .= " AND gp.general_product_id IN (" . ($general_product_ids ? join(",", $general_product_ids) : "-1") . ")";
    }

    if (def($params, "only_discount")) {
        $where .= " AND __discount_percent > 0";
    }

    $search_order = def($params, "search_order", "bestsellery");

    $actual_order = "gp.compare_sales DESC";
    if ($search_order === "najnowsze") {
        $actual_order = "gp.general_product_id DESC";
    } else  if ($search_order === "bestsellery") {
        $actual_order = "gp.compare_sales DESC";
    } else if ($search_order === "ceny-rosnaco") {
        $actual_order = "AVG(__current_gross_price) ASC";
    } else if ($search_order === "ceny-malejaco") {
        $actual_order = "AVG(__current_gross_price) DESC";
    } else if ($search_order === "general_product" && $GENERAL_PRODUCT_ID) {
        $actual_order = "gp.general_product_id ASC";

        $general_product_categories = DB::fetchArr("SELECT product_category_id, __level FROM general_product_to_category INNER JOIN product_category USING(product_category_id) WHERE general_product_id = $GENERAL_PRODUCT_ID");

        if ($general_product_categories) {
            //$from .= " INNER JOIN general_product_to_category USING(general_product_id)";
            $from .= " INNER JOIN general_product_to_category gptc ON gptc.general_product_id = gp.general_product_id";
            $where .= " AND product_category_id IN (" . join(",", array_column($general_product_categories, "product_category_id")) . ")";

            // a tiny factor usually
            $actual_order = "gp.compare_sales";

            foreach ($general_product_categories as $category) {
                $product_category_id = $category["product_category_id"];
                // * 100 cause it's important
                $score = round($category["__level"] * 100);
                // WELL, not sure of MAX, but even SUM works kinda :)
                $actual_order .= " + MAX(CASE WHEN product_category_id = $product_category_id THEN $score ELSE 0 END)";
            }

            // if u wanna debug baby
            if (User::getCurrent()->priveleges["backend_access"]) {
                //$actual_order = "CASE WHEN gp.general_product_id = 152 THEN 2137 ELSE 0 END";
                //die($actual_order);
            }

            $actual_order .= " DESC";
        }

        $where .= " AND gp.general_product_id <> $GENERAL_PRODUCT_ID";
    } else if ($search_order === "relevance") {
        $datatable_params["quick_search"] = def($params, "quick_search", "");
    }

    /** @var PaginationParams */
    $pagination_params = [
        "select" => "
        gp.general_product_id, gp.name, gp.__img_url, gp.__images_json, gp.__options_json, gp.__features_html,
        MIN(__current_gross_price) min_gross_price, MAX(__current_gross_price) max_gross_price, SUM(stock) as sum_stock,
        MAX(__discount_percent) max_discount_percent,
        GROUP_CONCAT(DISTINCT ptvo.product_variant_option_id SEPARATOR ',') as product_variant_option_ids_csv,
        GROUP_CONCAT(DISTINCT pvotfo.product_feature_option_id SEPARATOR ',') as product_feature_option_ids_csv,
        COUNT(DISTINCT p.product_id) as product_count,
        __avg_rating, __rating_count
    ",
        "from" => $from,
        "group" => "gp.general_product_id",
        "order" => $actual_order,
        "where" => $where,
        "datatable_params" => json_encode($datatable_params),
        "search_type" => $search_order === "relevance" ? "extended" : "regular",
        "quick_search_fields" => ["gp.__search"],
    ];

    $products_data = paginateData($pagination_params);

    ob_start();

    $product_block_class = "product_block";
    if ($layout === "slider") {
        $product_block_class .= " wo997_slide";
    }

    // it should be a template to use anywhere tho, well, not rly? sliders will be different by a lot anyway
    foreach ($products_data["rows"] as $product) {
        if (--$skip >= 0) {
            continue;
        }

        $id = $product["general_product_id"];
        $name = $product["name"];
        $img_url = $product["__img_url"];
        $images_json = $product["__images_json"];
        $min_gross_price = $product["min_gross_price"];
        $max_gross_price = $product["max_gross_price"];
        $sum_stock = $product["sum_stock"];
        $avg_rating = $product["__avg_rating"];
        $rating_count = $product["__rating_count"];
        $max_discount_percent = $product["max_discount_percent"];

        // TODO: hey, isn't it cute anyway?
        $features_html = ""; // $layout !== "slider" ? $product["__features_html"] : "";
        $options = json_decode($product["__options_json"], true);
        $product_count = $product["product_count"];

        $display_price = $min_gross_price; // . " zł";
        if ($min_gross_price !== $max_gross_price) {
            $display_price .= " - " . $max_gross_price; // . " zł";
        }
        $display_price .= " zł";

        $stock_class = "";
        if ($sum_stock > 0) {
            $stock_class = "available";
        } else {
            $stock_class = "unavailable";
        }

        $matched_product_variant_option_ids = explode(",", $product["product_variant_option_ids_csv"]);
        $product_feature_option_ids = explode(",", $product["product_feature_option_ids_csv"]);

        // get matched variant ids
        $product_definite_variant_option_ids = [];

        foreach ($options as $variant_id => $variant_option_ids) {
            if (count($variant_option_ids) === 1) {
                continue;
            }
            $first_matched_option_id = null;
            $definite = true;
            foreach ($variant_option_ids as $variant_option_id) {
                if (in_array($variant_option_id, $matched_product_variant_option_ids)) {
                    if ($first_matched_option_id) {
                        $definite = false;
                        break;
                    }
                    $first_matched_option_id = $variant_option_id;
                }
            }
            if ($definite && $first_matched_option_id) {
                $product_definite_variant_option_ids[] = $first_matched_option_id;
            }
        }

        $option_names = getVariantNamesFromOptionIds($product_definite_variant_option_ids);
        $link = getProductLink($id, $name, $product_definite_variant_option_ids, $option_names);

        // adjust images positions for best relevance
        $images = json_decode($images_json, true);

        if ($images) {
            $index = -1;
            foreach ($images as &$image) {
                $index++;
                $weight = -$index;
                foreach ($image["feature_option_ids"] as $feature_option_id) {
                    if (in_array($feature_option_id, $product_feature_option_ids)) {
                        $weight += 100;
                    }
                }
                $image["weight"] = $weight;
            }
            unset($image);
            usort($images, fn ($a, $b) => $b["weight"] <=> $a["weight"]);
            $images_json = json_encode(array_column($images, "img_url"), true);
            $img_url = $images[0]["img_url"];
        } else {
            $images_json = "[]";
        }

        // <div class="product_variants">
        //     <div class="header">
        //         <span><?= $product_count ></span>
        //         <i class="fas fa-list-ul"></i>
        //     </div>
        //     <?php if ($features_html) : >
        //         <div class="list smooth_scrollbar"><?= $features_html ></div>
        //     <?php endif >
        // </div>

?>
        <div class="<?= $product_block_class ?>">
            <a href="<?= $link ?>">
                <div class="product_img_wrapper" data-images="<?= htmlspecialchars($images_json) ?>">
                    <img data-src="<?= $img_url ?>" class="product_img wo997_img" alt="">
                </div>
                <h3 class="product_name check_tooltip"><?= $name ?></h3>
                <?php if ($max_discount_percent > 0) : ?>
                    <div class="product_discount">-<?= $max_discount_percent ?>%</div>
                <?php endif ?>
            </a>
            <div class="product_row">
                <span class="product_price pln"><?= $display_price ?></span>
                <span class="product_rating rating"><span class="stars"><?= $avg_rating ?></span> (<?= $rating_count ?>)</span>
                <div style="width:100%"></div>
                <span class="product_stock <?= $stock_class ?>"></span>
            </div>
        </div>
<?php
    }

    $products_data["html"] = ob_get_clean();

    return $products_data;
}

function getAllGeneralProducts()
{
    return DB::fetchArr("SELECT * FROM general_product");
}

function preloadGeneralProducts()
{
    $general_products = json_encode(getAllGeneralProducts());
    return <<<JS
    general_products = $general_products;
    loadedGeneralProducts();
JS;
}

function getGeneralProductDTProducts($general_product_id)
{
    $general_product = EntityManager::getEntityById("general_product", $general_product_id);

    /** @var Entity[] */
    $products = $general_product->getProp("products");
    $pd = [];
    foreach ($products as $product) {
        $pd[] = filterArrayKeys($product->getSimpleProps(), [
            "general_product_id",
            "net_price",
            "gross_price",
            "vat_id",
            "active",
            "stock",
            "weight",
            "length",
            "width",
            "height",
            "product_id",
            "variant_options",
            "discount_gross_price",
            "discount_untill"
        ]);
    }
    return $pd;
}
