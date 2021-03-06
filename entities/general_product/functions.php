<?php //hook[helper]

function getGlobalProductsSearch($params)
{
    $where = "1";

    $unique_option_ids = [];

    if (isset($params["option_id_groups"])) {
        $option_id_groups = json_decode($params["option_id_groups"]);
        foreach ($option_id_groups as $option_ids) {
            if (count($option_ids) === 1) {
                $unique_option_ids[] = $option_ids[0];
            }
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
        "select" => "general_product_id, name, __img_url, __images_json, __selectable_option_ids_json",
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
    ]);

    $html = "";

    // it should be a template to use anywhere tho
    foreach ($products_data["rows"] as $product) {
        $id = $product["general_product_id"];
        $name = $product["name"];
        $img_url = $product["__img_url"];
        $images_json = htmlspecialchars($product["__images_json"]);

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
            <span class=\"product-price pln\">000 zł</span>
            <span class=\"product-rating\">4/5</span>
        </div>
    </div>";
    }

    return ["html" => $html];
}
