<?php //hook[helper]

function getGlobalProductsSearch($params)
{
    $where = "1";

    $unique_option_ids = [];

    $from = "
        general_product gp
        INNER JOIN product p USING (general_product_id)
        INNER JOIN general_product_to_category gptc USING (general_product_id)
    ";

    if (isset($params["option_id_groups"])) {
        $option_id_groups = json_decode($params["option_id_groups"]);
        $query_counter = 0;
        foreach ($option_id_groups as $option_ids) {
            $query_counter++;
            if (count($option_ids) === 1) {
                $unique_option_ids[] = $option_ids[0];
            }
            $option_ids_csv = clean(implode(",", $option_ids));
            if ($option_ids_csv) {
                $where .= " AND ptfo_$query_counter.product_feature_option_id IN ($option_ids_csv)";
                $from .= " INNER JOIN product_to_feature_option ptfo_$query_counter USING (product_id)";
            }
        }
    }

    if (isset($params["product_category_id"])) {
        $product_category_id = intval($params["product_category_id"]);
        if ($product_category_id) {
            $where .= " AND gptc.product_category_id = $product_category_id";
        }
    }

    $products_data = paginateData([
        "select" => "
            gp.general_product_id, gp.name, gp.__img_url, gp.__images_json, gp.__selectable_option_ids_json,
            MIN(gross_price) min_gross_price, MAX(gross_price) max_gross_price, SUM(stock) as sum_stock
        ",
        "from" => $from,
        "group" => "general_product_id",
        "order" => "general_product_id DESC",
        "where" => $where,
        "quick_search_fields" => ["name"],
        "datatable_params" => $params["datatable_params"],
    ]);

    $html = "";

    // it should be a template to use anywhere tho
    foreach ($products_data["rows"] as $product) {
        $id = $product["general_product_id"];
        $name = $product["name"];
        $img_url = $product["__img_url"];
        $images_json = htmlspecialchars($product["__images_json"]);
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

        $selectable_option_ids_json = htmlspecialchars($product["__selectable_option_ids_json"]);
        $option_ids = array_intersect($unique_option_ids, json_decode($selectable_option_ids_json, true));
        $option_names = getNamesFromOptionIds($option_ids);
        $link = getProductLink($id, $name, $option_ids, $option_names);

        $html .= "<div class=\"product_block\">
            <a href=\"$link\">
                <div class=\"product_img_wrapper\" data-images=\"$images_json\">
                    <img data-src=\"$img_url\" data-height=\"1w\" class=\"product_img wo997_img\" alt=\"\">
                </div>
                <h3 class=\"product_name\"><span class='check-tooltip'>$name</span></h3>
            </a>
            <div class=\"product-row\">
                <span class=\"product_price pln\">$display_price</span>
                <span class=\"product_rating\"></span>
                <br>
                <span class=\"product_stock $stock_class\"></span>
            </div>
        </div>";
    }

    return ["html" => $html, "total_rows" => $products_data["total_rows"]];
}
