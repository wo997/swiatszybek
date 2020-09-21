<?php

/*useJS($moduleDir . "/main.js?v=" . RELEASE); // global
useCSS($moduleDir . "/main.css?v=" . RELEASE);*/

global $already_shown_product_ids_string;

if ($already_shown_product_ids_string === null) {
  $already_shown_product_ids_string = "";
}



$shared_where = "p.published = 1"; // AND v.published = 1";
$where = $shared_where;
$join = "";

$product_list_count = nonull($moduleParams, "product_list_count", 8);
$layout = nonull($moduleParams, "layout", "grid");
$search = nonull($moduleParams, "search", "");
$is_basic = nonull($moduleParams, "basic", "");

$price_min = trim(nonull($moduleParams, "price_min", ""));
$price_max = trim(nonull($moduleParams, "price_max", ""));

if (isset($moduleParams["category_ids"])) {
  if (is_array($moduleParams["category_ids"])) {
    $category_ids =  $moduleParams["category_ids"] = array_filter($moduleParams["category_ids"], function ($id) {
      return $id !== "0" && $id !== 0;
    });
    if ($category_ids) {
      $join .= " INNER JOIN link_product_category USING(product_id)";
      $where .= " AND category_id IN (" . clean(implode(",", $moduleParams["category_ids"])) . ")";
    }
  }
}

$hasAnyAttribute = false;
if (isset($moduleParams["attribute_value_ids"])) {
  $attribute_value_ids = $moduleParams["attribute_value_ids"];

  if (is_array($attribute_value_ids)) {
    foreach ($attribute_value_ids as $attribute_value_sub_ids) {
      $subAttributeValues = "";
      foreach ($attribute_value_sub_ids as $attribute_value_id) {
        $subAttributeValues .= "$attribute_value_id,";
      }
      if ($subAttributeValues) {
        $hasAnyAttribute = true;
        $subAttributeValues = rtrim($subAttributeValues, ",");
        $where .= " AND (" .
          "av.value_id IN($subAttributeValues)" .
          " OR " .
          "ap.value_id IN($subAttributeValues)" .
          ")";
      }
    }
  }
}

$price_query = "";
if ($price_min) {
  $price_query .= " AND price_max >= " . intval($price_min);
}
if ($price_max) {
  $price_query .= " AND price_min <= " . intval($price_max);
}
$where .= $price_query;

//if ($hasAnyAttribute) {
$join .= " INNER JOIN variant v USING(product_id)
      LEFT JOIN link_variant_attribute_value av USING(variant_id)
      LEFT JOIN link_product_attribute_value ap USING(product_id)";
//}

$order_by = "product_id DESC"; // new by default

$order_by_name = nonull($moduleParams, "order_by", "new");

if ($order_by_name == "sale") {
  $order_by = "cache_sales DESC";
} else if ($order_by_name == "cheap") {
  $order_by = "price_min ASC";
} else if ($order_by_name == "random") {
  $order_by = "RAND() DESC";
}


$select_query = "product_id, title, link, cache_thumbnail, gallery, price_min, price_max, cache_avg_rating";
if ($is_basic) {
  $select_query = "product_id, title, link";
}

if (!empty($already_shown_product_ids_string)) {
  //$where .= " AND product_id NOT IN(" . substr($already_shown_product_ids_string, 0, -1) . ")";
}

$params = [
  "select" => $select_query,
  "from" => "products p $join",
  "where" => $where,
  "order" => $order_by,
  "group" => "product_id",
  "raw" => true,
  "main_search_fields" => ["title", "name"]
];

$price_info = fetchRow("SELECT MIN(price_min) as min, MAX(price_max) as max FROM products p $join WHERE " . str_replace($price_query, "", $where));

if ($search) {
  $params["search"] = $search;
}

$products = paginateData($params);

$res = "";
if ($is_basic) {
  foreach ($products["results"] as $product) {
    $res .= "<a class='result' href='" . getProductLink($product["product_id"], $product["link"]) . "'>" . $product["title"] . "</a>";
  }
  $module_content .= $res;
} else {
  foreach ($products["results"] as $product) {
    $already_shown_product_ids_string .= $product["product_id"] . ",";

    $priceText = $product["price_min"];
    if (!empty($product["price_max"]) && $product["price_min"] != $product["price_max"])
      $priceText .= " - " . $product["price_max"];

    $priceText = preg_replace("/\.00/", "", $priceText);

    if (!$product["gallery"]) {
      $product["gallery"] = $product["cache_thumbnail"];
    }
    if ($layout == "slider") {
      $res .= "<div class='product-block-wapper swiper-slide'>";
    } else {
      $res .= "<div class='product-block-wapper'>";
    }

    $res .= "
      <div class='product-block'>
        <a href='" . getProductLink($product["product_id"], $product["link"]) . "'>
          <img data-src='" . $product["cache_thumbnail"] . "' data-height='1w' class='product-image' alt='" . $product["title"] . "' data-gallery='" . $product["gallery"] . "'>
          <h3 class='product-title'><span class='check-tooltip'>" . $product["title"] . "</span></h3>
          <span class='product-price pln'>$priceText zł</span>
          <span class='product-rating'>" . ratingBlock($product["cache_avg_rating"]) . "</span>
          <!--<div class='buynow btn'>KUP TERAZ</div>-->
        </a>
      </div>
    ";

    $res .= "</div>";
  }

  if ($layout == "slider") {
    $module_content .= "
      <div class='product_list_module slider swiper-all'>
        <div class='swiper-container'>
          <div class='swiper-wrapper'>$res</div>
        </div>
        <div class='swiper-button-prev swiper-nav'><i class='fas fa-chevron-left'></i></div>
        <div class='swiper-button-next swiper-nav'><i class='fas fa-chevron-right'></i></div>
      </div>
    ";
  } else {
    $module_content .= "<div class='product_list_module grid'>$res</div>";
  }
}
