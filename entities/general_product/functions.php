<?php //hook[helper]

function getGlobalProductsSearch($url, $options = [])
{
    // setup search vars

    $url_data = parse_url($url);
    $url_vars = explode("/", trim($url_data["path"], "/"));
    parse_str(def($url_data, "query", ""), $get_vars);

    $product_category_id = intval(def($url_vars, 1, -1));

    $page_id = intval(def($get_vars, "str", 1)) - 1;
    $row_count = intval(def($get_vars, "ile", 25));

    $search_phrase = def($get_vars, "znajdz", "");

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
            WHERE p.product_id IN ($product_ids_csv) AND (pvotfo.product_feature_option_id IN ($option_ids_csv) OR (gptfo.is_shared = 1 AND gptfo.product_feature_option_id IN ($option_ids_csv)))
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
                INNER JOIN product_variant_option_to_feature_option pvotfo
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
                $min = $double_base * $unit_data["factor"];
            }

            $min -= 0.000001;
            if ($is_cena) {
                $where .= " AND gross_price >= $min";
            } else {
                $where .= " AND (pfo.double_value >= $min OR (gptfo.is_shared = 1 AND gpfo.double_value >= $min))";
            }
        }
        if ($max !== "") {
            preg_match('/[a-zA-Z]/', $max, $matches, PREG_OFFSET_CAPTURE);
            if ($matches) {
                $unit_id = substr($max, $matches[0][1]);
                $unit_data = getPhysicalMeasureUnit($unit_id);
                $double_base = substr($max, 0, $matches[0][1]);
                $max = $double_base * $unit_data["factor"];
            }

            $max += 0.000001;
            if ($is_cena) {
                $where .= " AND gross_price <= $max";
            } else {
                $where .= " AND (pfo.double_value <= $max OR (gptfo.is_shared = 1 AND gpfo.double_value <= $max))";
            }
        }

        $product_ids = DB::fetchCol("SELECT product_id FROM $from WHERE $where GROUP BY product_id");
    }

    // and text search at the end
    if ($search_phrase) {
        $datatable_params["quick_search"] = $search_phrase;

        $product_ids_csv = $product_ids ? join(",", $product_ids) : "-1";

        $from = "general_product gp INNER JOIN product p USING (general_product_id)";
        $where = "p.product_id IN ($product_ids_csv)";
        $where .= " " . getSearchQuery(["quick_search" => $search_phrase, "quick_search_fields" => ["gp.__search"], "search_type" => "extended"]);

        $product_ids = DB::fetchCol("SELECT product_id
            FROM general_product gp
            INNER JOIN product p USING (general_product_id)
            WHERE $where
            GROUP BY product_id");
    }

    // do the actual search / pagination for everything

    /** @var DatatableParams */
    $datatable_params = ["page_id" => $page_id, "row_count" => $row_count, "filters" => []];

    $product_ids_csv = $product_ids ? join(",", $product_ids) : "-1";

    /** @var PaginationParams */
    $pagination_params = [
        "select" => "
            gp.general_product_id, gp.name, gp.__img_url, gp.__images_json, gp.__options_json, gp.__features_html,
            MIN(gross_price) min_gross_price, MAX(gross_price) max_gross_price, SUM(stock) as sum_stock,
            GROUP_CONCAT(DISTINCT ptvo.product_variant_option_id SEPARATOR ',') as product_variant_option_ids_csv,
            GROUP_CONCAT(DISTINCT pvotfo.product_feature_option_id SEPARATOR ',') as product_feature_option_ids_csv,
            COUNT(DISTINCT p.product_id) as product_count,
            __avg_rating, __rating_count
        ",
        "from" => "general_product gp
            INNER JOIN product p USING (general_product_id)
            INNER JOIN product_to_variant_option ptvo ON ptvo.product_id = p.product_id
            INNER JOIN product_variant_option_to_feature_option pvotfo USING(product_variant_option_id)",
        "group" => "general_product_id",
        "order" => "general_product_id DESC",
        "where" => "p.product_id IN ($product_ids_csv)",
        "datatable_params" => json_encode($datatable_params),
        "search_type" => "extended",
        "quick_search_fields" => ["gp.__search"],
    ];

    $products_data = paginateData($pagination_params);

    $html = "";

    // it should be a template to use anywhere tho, well, not rly? sliders will be different by a lot anyway
    foreach ($products_data["rows"] as $product) {
        $id = $product["general_product_id"];
        $name = $product["name"];
        $img_url = $product["__img_url"];
        $images_json = $product["__images_json"];
        $min_gross_price = $product["min_gross_price"];
        $max_gross_price = $product["max_gross_price"];
        $sum_stock = $product["sum_stock"];
        $avg_rating = $product["__avg_rating"];
        $rating_count = $product["__rating_count"];
        $features_html =  $product["__features_html"];
        $options = json_decode($product["__options_json"], true);
        $product_count = $product["product_count"];

        $display_price = $min_gross_price . " zł";
        if ($min_gross_price !== $max_gross_price) {
            $display_price .= " - " . $max_gross_price . "zł";
        }

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
        $images_json_safe = htmlspecialchars($images_json);

        $html .= "<div class=\"product_block\">
            <a href=\"$link\">
                <div class=\"product_img_wrapper\" data-images=\"$images_json_safe\">
                    <img data-src=\"$img_url\" data-height=\"1w\" class=\"product_img wo997_img\" alt=\"\">
                </div>
                <h3 class=\"product_name check_tooltip\">$name</h3>
            </a>
            <div class=\"product_row\">
                <span class=\"product_price pln\">$display_price</span>
                <span class=\"product_rating rating\"><span class=\"stars\">$avg_rating</span> ($rating_count)</span>
                <div style=\"width:100%\"></div>
                <span class=\"product_stock $stock_class\"></span>
                <div class=\"product_variants\">
                    <div class=\"header\"> 
                        <span>$product_count</span>
                        <i class=\"fas fa-list-ul\"></i>
                    </div>
                    <div class=\"list smooth_scrollbar\">
                        $features_html
                    </div>
                </div>
            </div>
        </div>";
    }

    $products_data["html"] = $html;

    // print actual (not general) product count
    $products_data["total_rows"] = count($product_ids);
    $products_data["all_ids"] = $product_ids;

    return $products_data;
}
