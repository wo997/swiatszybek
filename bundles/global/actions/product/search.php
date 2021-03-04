<?php //route[product/search]  

$where = "1";

if (isset($_POST["option_ids"])) {
    $option_ids = clean($_POST["option_ids"]);
    if ($option_ids) {
        $where .= " AND gptfo.product_feature_option_id IN ($option_ids)";
    }
}

if (isset($_POST["product_category_id"])) {
    $product_category_id = intval($_POST["product_category_id"]);
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
    "datatable_params" => $_POST["datatable_params"],
    "return_all_ids" => true,
    "primary_key" => "general_product_id"
]);

$html = "";

foreach ($products_data["rows"] as $product) {
    $html .= "<div class=\"product_block\">
        <a href=\"" . getProductLink($product["general_product_id"], $product["name"]) . "\">
            <img data-src=\"" . $product["__img_url"] . "\" data-height=\"1w\" class=\"product_image wo997_img\" alt=\"\" data-images=\"" . htmlspecialchars($product["__images_json"]) . "\">
            <h3 class=\"product_name\"><span class='check-tooltip'>" . $product["name"] . "</span></h3>
        </a>
        <div class=\"product-row\">
            <span class=\"product-price pln\">000 zł</span>
            <span class=\"product-rating\">4/5</span>
        </div>
    </div>";
}

$all_ids_csv = implode(",", $products_data["all_ids"]);
$option_ids = $all_ids_csv ? DB::fetchCol("SELECT DISTINCT product_feature_option_id
    FROM general_product INNER JOIN general_product_to_feature_option gptfo USING (general_product_id)
    WHERE general_product_id IN ($all_ids_csv)") : [];

Request::jsonResponse(["html" => $html, "option_ids" => $option_ids]);
