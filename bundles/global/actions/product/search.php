<?php //route[product/search]  

$products = paginateData([
    "select" => "general_product_id, name, __img_url",
    "from" => "general_product",
    "group" => "general_product_id",
    "order" => "general_product_id DESC",
    "quick_search_fields" => ["name"],
    "datatable_params" => $_POST["datatable_params"]
]);

$html = "";

foreach ($products["rows"] as $product) {
    $html .= "<div class='product_block' data-product_id='" . $product["general_product_id"] . "'>
        <a href='" . getProductLink($product["general_product_id"], $product["name"]) . "'>
            <img data-src='" . $product["__img_url"] . "' data-height='1w' class='product_image wo997_img' alt=\"\" data-gallery=\""  . "\">
            <h3 class='product_name'><span class='check-tooltip'>" . $product["name"] . "</span></h3>
        </a>
        <div class='product-row'>
            <span class='product-price pln'>000 zł</span>
            <span class='product-rating'>4/5</span>
        </div>
    </div>";
}

Request::jsonResponse(["html" => $html]);
