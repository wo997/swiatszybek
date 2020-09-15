<?php

/*useJS($moduleDir . "/main.js?v=" . RELEASE); // global
useCSS($moduleDir . "/main.css?v=" . RELEASE);*/

$shared_where = "p.published = 1"; // AND v.published = 1";
$where = $shared_where;
$join = "";

$product_list_count = nonull($moduleParams, "product_list_count", 8);

$layout = nonull($moduleParams, "layout", "grid");

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

  if ($attribute_value_ids) {
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

if ($hasAnyAttribute) {
  $join .= " INNER JOIN variant v USING(product_id)
      LEFT JOIN link_variant_attribute_value av USING(variant_id)
      LEFT JOIN link_product_attribute_value ap USING(product_id)";
}

$order_by = "product_id DESC"; // new by default

$order_by_name = nonull($moduleParams, "order_by", "new");

if ($order_by_name == "sale") {
  $order_by = "cache_sales DESC";
} else if ($order_by_name == "cheap") {
  $order_by = "price_min ASC";
} else if ($order_by_name == "random") {
  $order_by = "RAND() DESC";
}

$products = paginateData([
  "select" => "product_id, title, link, cache_thumbnail, gallery, price_min, price_max, cache_avg_rating",
  "from" => "products p $join",
  "where" => $where,
  "order" => $order_by,
  "group" => "product_id",
  "raw" => true,
]);

//$products = fetchArray("SELECT product_id, title, link, cache_thumbnail, gallery, price_min, price_max, cache_avg_rating
//FROM products p $join $where ORDER BY product_id DESC LIMIT " . intval($product_list_count));

$res = "";
foreach ($products["results"] as $product) {
  $priceText = $product["price_min"];
  if (!empty($product["price_max"]) && $product["price_min"] != $product["price_max"])
    $priceText .= " - " . $product["price_max"];

  $priceText = preg_replace("/\.00/", "", $priceText);

  if (!$product["gallery"]) {
    $product["gallery"] = $product["cache_thumbnail"];
  }
  //<div class='item-image' style='background-image:url(\"/uploads/md/" . $product["cache_thumbnail"] . "\")' data-desktop='/uploads/md/" . $product["gallery"] . "'></div>

  if ($layout == "slider") {
    $res .= "<div class='product-block-wapper swiper-slide'>";
  } else {
    $res .= "<div class='product-block-wapper'>";
  }

  $res .= "
      <div class='product-block'>
        <a href='" . getProductLink($product["product_id"], $product["link"]) . "' data-gallery='" . $product["gallery"] . "'>
          <img data-src='" . $product["cache_thumbnail"] . "' data-height='1w' class='product-image'>
          <h3 class='product-title'>" . $product["title"] . "</h3>
          <span class='product-price pln'>$priceText zł</span>
          <div class='product-rating'>" . ratingBlock($product["cache_avg_rating"]) . "</div>
          <!--<div class='buynow btn'>KUP TERAZ</div>-->
        </a>
      </div>
    ";

  //if ($layout == "slider") {
  //}
  $res .= "</div>";
}

//$module_content .=
//"<div class='items count-$total'>$res</div>";



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

  /*$module_content .= "<style>
      div[data-module='product_list'] .product {width: 48%;}
      @media only screen and (max-width: 749px) {
        div[data-module='product_list'] .product {width: 98%;}
      }
      @media only screen and (min-width: 750px) {
        .items > div:not(:nth-child(3n)):not(:last-child) {
          border-right: 2px solid #eee;
        }
      }
    </style>";*/
