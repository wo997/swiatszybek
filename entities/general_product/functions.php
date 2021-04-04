<?php //hook[helper]

function getGlobalProductsSearch($url, $options = [])
{
    $url_data = parse_url($url);
    $url_vars = explode("/", trim($url_data["path"], "/"));
    parse_str(def($url_data, "query", ""), $get_vars);

    $product_category_id = intval(def($url_vars, 1, -1));

    $page_id = intval(def($get_vars, "str", 1)) - 1;
    $row_count = intval(def($get_vars, "ile", 25));

    /** @var DatatableParams */
    $datatable_params = ["page_id" => $page_id, "row_count" => $row_count, "filters" => []];

    $where = "gp.active";

    $unique_option_ids = [];

    $from = "general_product gp INNER JOIN product p USING (general_product_id)";
    if ($product_category_id !== -1) {
        $from .= "INNER JOIN general_product_to_category gptc USING (general_product_id)";
        $where .= " AND gptc.product_category_id = $product_category_id";
    }

    $query_counter = 0;
    foreach (explode("-", def($get_vars, "v", "")) as $option_ids_str) {
        $query_counter++;

        $option_ids = array_map(fn ($x) => intval($x), explode("i", $option_ids_str));
        if (count($option_ids) === 1) {
            $unique_option_ids[] = $option_ids[0];
        }
        $option_ids_csv = clean(implode(",", $option_ids));
        if ($option_ids_csv) {
            $from .= " INNER JOIN product_to_feature_option ptfo_$query_counter USING (product_id)";
            $where .= " AND ptfo_$query_counter.product_feature_option_id IN ($option_ids_csv)";
        }
    }

    foreach ($get_vars as $product_feature_id => $range_str) {
        if (!preg_match('/^(r\d*|cena)$/', $product_feature_id)) {
            continue;
        }

        $query_counter++;

        $val_parts = explode("do", $range_str);

        $min = def($val_parts, 0, "");
        $max = strpos($range_str, "do") === false ? $min : def($val_parts, 1, "");

        if ($min !== "" || $max !== "") {
            $is_cena = $product_feature_id === "cena";
            if (!$is_cena) {
                $product_feature_id = numberFromStr($product_feature_id);
            }

            if (!$is_cena) {
                $from .= " INNER JOIN product_to_feature_option ptfo_$query_counter USING (product_id) INNER JOIN product_feature_option pfo_$query_counter ON ptfo_$query_counter.product_feature_option_id = pfo_$query_counter.product_feature_option_id AND pfo_$query_counter.product_feature_id = $product_feature_id";
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
                    $where .= " AND pfo_$query_counter.double_value >= $min";
                }
            }
            if ($max !== "") {
                preg_match('/[a-zA-Z]/', $max, $matches, PREG_OFFSET_CAPTURE);
                if ($matches) {
                    $unit_id = substr($max, $matches[0][1]);
                    $unit_data = getPhysicalMeasureUnit($unit_id);
                    $double_base =  substr($max, 0, $matches[0][1]);
                    $max = $double_base * $unit_data["factor"];
                }

                $max += 0.000001;
                if ($is_cena) {
                    $where .= " AND gross_price <= $max";
                } else {
                    $where .= " AND pfo_$query_counter.double_value <= $max";
                }
            }
        }
    }

    $search_phrase = def($get_vars, "znajdz", "");
    if ($search_phrase) {
        $datatable_params["quick_search"] = $search_phrase;
    }

    /** @var PaginationParams */
    $pagination_params = [
        "select" => "
            gp.general_product_id, gp.name, gp.__img_url, gp.__images_json, gp.__options_json, gp.__options_html,
            MIN(gross_price) min_gross_price, MAX(gross_price) max_gross_price, SUM(stock) as sum_stock,
            JSON_ARRAYAGG(p.__options_json) products_options_jsons_json,
            __avg_rating, __rating_count
        ",
        "from" => $from,
        "group" => "general_product_id",
        "order" => "general_product_id DESC",
        "where" => $where,
        "datatable_params" => json_encode($datatable_params),
        "search_type" => "extended",
        "quick_search_fields" => ["gp.__search"],
    ];

    if (isset($options["return_all_ids"])) {
        $pagination_params["primary_key"] = "product_id";
        $pagination_params["return_all_ids"] = true;
    }

    $products_data = paginateData($pagination_params);

    $html = "";

    // it should be a template to use anywhere tho
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
        $options_html =  $product["__options_html"];

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

        json_decode($product["__options_json"], true);

        $products_options_jsons_json = json_decode($product["products_options_jsons_json"]);

        $matched_options = [];
        foreach ($products_options_jsons_json as $product_options_json) {
            $product_options = json_decode($product_options_json, true);
            if ($product_options) {
                foreach ($product_options as $feature_id => $option_ids) {
                    if (!isset($matched_options[$feature_id])) {
                        $matched_options[$feature_id] = [];
                    }
                    foreach ($option_ids as $option_id) {
                        if (!in_array($option_id, $matched_options[$feature_id])) {
                            $matched_options[$feature_id][] = $option_id;
                        }
                    }
                }
            }
        }

        $unique_option_ids = [];

        foreach ($matched_options as $feature_id => $option_ids) {
            if (count($option_ids) === 1) {
                $unique_option_ids[] = $option_ids[0];
            }
        }

        $option_names = getValuesFromOptionIds($unique_option_ids);
        $link = getProductLink($id, $name, $unique_option_ids, $option_names);

        $option_ids_csv = join(",", $option_ids);

        // adjust images positions for best relevance
        $images = json_decode($images_json, true);

        if ($images) {
            $index = -1;
            foreach ($images as &$image) {
                $index++;
                $weight = -$index;
                foreach ($image["option_ids"] as $option_id) {
                    if (in_array($option_id, $unique_option_ids)) {
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
                <i class=\"fas show_features fa-list-ul\"></i>
                <div class=\"features_wrapper\">
                    <div class=\"product_features smooth_scrollbar\">
                        $options_html
                    </div>
                </div>
            </div>
        </div>";
    }

    $products_data["html"] = $html;
    return $products_data;
}
