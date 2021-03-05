<?php //hook[helper]

function getGlobalProductsSearch($params)
{
    $where = "1";

    if (isset($params["option_id_groups"])) {
        $option_id_groups = json_decode($params["option_id_groups"]);
        foreach ($option_id_groups as $option_ids) {
            $option_ids_csv = clean(implode(",", $option_ids));
            if ($option_ids_csv) {
                $where .= " AND gptfo.product_feature_option_id IN ($option_ids_csv)";
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
        "select" => "general_product_id, name, __img_url, __images_json",
        "from" => "
        general_product
        INNER JOIN general_product_to_feature_option gptfo USING (general_product_id)
        INNER JOIN general_product_to_category gptc USING (general_product_id)
    ",
        "group" => "general_product_id",
        "order" => "general_product_id DESC",
        "where" => $where,
        "quick_search_fields" => ["name"],
        "datatable_params" => $params["datatable_params"],
        "return_all_ids" => true,
        "primary_key" => "general_product_id"
    ]);

    $html = "";

    // it should be a template to use anywhere tho
    foreach ($products_data["rows"] as $product) {
        $html .= "<div class=\"product_block\">
        <a href=\"" . getProductLink($product["general_product_id"], $product["name"]) . "\">
            <div class=\"product_img_wrapper\" data-images=\"" . htmlspecialchars($product["__images_json"]) . "\">
                <img data-src=\"" . $product["__img_url"] . "\" data-height=\"1w\" class=\"product_img wo997_img\" alt=\"\">
            </div>
            <h3 class=\"product_name\"><span class='check-tooltip'>" . $product["name"] . "</span></h3>
        </a>
        <div class=\"product-row\">
            <span class=\"product-price pln\">000 zł</span>
            <span class=\"product-rating\">4/5</span>
        </div>
    </div>";
    }

    $all_ids_csv = implode(",", $products_data["all_ids"]);
    $options_data = $all_ids_csv ? DB::fetchArr("SELECT COUNT(1) count, product_feature_option_id option_id
    FROM general_product INNER JOIN general_product_to_feature_option gptfo USING (general_product_id)
    WHERE general_product_id IN ($all_ids_csv) GROUP BY product_feature_option_id") : [];

    return ["html" => $html, "options_data" => $options_data];
}
