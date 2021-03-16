<?php //hook[helper]

function getGlobalProductsSearch($url, $options = [])
{
    $url_data = parse_url($url);
    $url_vars = explode("/", trim($url_data["path"], "/"));
    parse_str(def($url_data, "query", ""), $get_vars);

    $product_category_id = intval(def($url_vars, 1, -1));

    $page_id = intval(def($get_vars, "str", 1)) - 1;
    $row_count = intval(def($get_vars, "ile", 25));

    $price_str = def($get_vars, "cena", "");
    $price_parts = explode("l", $price_str);
    $price_min = def($price_parts, 0, "");
    $price_max = def($price_parts, 1, "");

    /** @var DatatableParams */
    $datatable_params = ["page_id" => $page_id, "row_count" => $row_count, "filters" => []];

    $where = "1";

    $unique_option_ids = [];

    $from = "
        general_product gp
        INNER JOIN product p USING (general_product_id)
        INNER JOIN general_product_to_category gptc USING (general_product_id)
    ";

    $query_counter = 0;
    foreach (explode("-", def($get_vars, "v", "")) as $option_ids_str) {
        $query_counter++;

        $option_ids = array_map(fn ($x) => intval($x), explode("l", $option_ids_str));
        if (count($option_ids) === 1) {
            $unique_option_ids[] = $option_ids[0];
        }
        $option_ids_csv = clean(implode(",", $option_ids));
        if ($option_ids_csv) {
            $from .= " INNER JOIN product_to_feature_option ptfo_$query_counter USING (product_id)";
            $where .= " AND ptfo_$query_counter.product_feature_option_id IN ($option_ids_csv)";
        }
    }

    foreach (explode("-", def($get_vars, "r", "")) as $range_full_str) {
        $query_counter++;

        $range_full_str_parts = explode("_", $range_full_str);
        $product_feature_id = def($range_full_str_parts, 0, "");

        if ($product_feature_id === "") {
            continue;
        }

        $range_str = def($range_full_str_parts, 1, "");
        $val_parts = explode("l", $range_str);

        $min = def($val_parts, 0, "");
        $max = def($val_parts, 1, "");

        if ($min !== "" || $max !== "") {
            $from .= " INNER JOIN product_to_feature_option ptfo_$query_counter USING (product_id) INNER JOIN product_feature_option pfo_$query_counter ON ptfo_$query_counter.product_feature_option_id = pfo_$query_counter.product_feature_option_id AND pfo_$query_counter.product_feature_id = $product_feature_id";
            if ($min !== "") {
                $min = floatval(preg_replace("/^0/", "0.", $min)) - 0.000001;
                $where .= " AND pfo_$query_counter.double_value > $min";
            }
            if ($max !== "") {
                $max = floatval(preg_replace("/^0/", "0.", $max)) + 0.000001;
                $where .= " AND pfo_$query_counter.double_value < $max";
            }
        }
    }

    if ($product_category_id !== -1) {
        $where .= " AND gptc.product_category_id = $product_category_id";
    }

    if ($price_min !== "") {
        $where .= " AND p.gross_price >= " . floatval($price_min);
    }
    if ($price_max !== "") {
        $where .= " AND p.gross_price <= " . floatval($price_max);
    }

    $search_phrase = def($get_vars, "znajdz", "");
    if ($search_phrase) {
        $datatable_params["quick_search"] = $search_phrase;
    }

    /** @var PaginationParams */
    $pagination_params = [
        "select" => "
            gp.general_product_id, gp.name, gp.__img_url, gp.__images_json, gp.__options_json,
            MIN(gross_price) min_gross_price, MAX(gross_price) max_gross_price, SUM(stock) as sum_stock,
            JSON_ARRAYAGG(p.__options_json) products_options_jsons_json
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
            $images_json = json_encode($images, true);
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
                <h3 class=\"product_name\"><span class='check-tooltip'>$name</span></h3>
            </a>
            <div class=\"product_row\">
                <span class=\"product_price pln\">$display_price</span>
                <span class=\"product_rating\"></span>
                <br>
                <span class=\"product_stock $stock_class\"></span>
            </div>
        </div>";
    }

    $products_data["html"] = $html;
    return $products_data;
}
