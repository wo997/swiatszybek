<?php

$user_basket = [];

$basket = json_decode($_SESSION["basket"],true);

$basket_variant_id_list = "";
foreach ($basket as $basket_item) {
  $basket_variant_id_list .= $basket_item["variant_id"].",";
}

$where = "1";

if ($basket_variant_id_list) {
  $where .= " AND variant_id IN (".substr($basket_variant_id_list, 0, -1).")";
}

$unordered_basket_variants = fetchArray("SELECT variant_id, product_id, title, link, name, zdjecie, price, rabat, stock
  FROM products i INNER JOIN variant v USING (product_id) WHERE $where");

$basket_variants = [];

foreach ($basket as $basket_item) { // merge variants with quantity into basket, simple right?
  foreach ($unordered_basket_variants as $unordered_basket_variant) {
    if ($unordered_basket_variant["variant_id"] == $basket_item["variant_id"]) {
      $unordered_basket_variant["quantity"] = $basket_item["quantity"];
      $basket_variants[] = $unordered_basket_variant;
      break;
    }
  }
}

$totalBasketCost = 0;

$item_count = 0;

foreach($basket_variants as $basket_variant_index => $basket_variant) {
  $basket_variant["real_price"] = $basket_variant["price"] - $basket_variant["rabat"];

  $total_price = 0;
  for ($i=0; $i<$basket_variant["quantity"]; $i++) // u can add special offers here later
  {
    $item_count++;
    $total_price += $basket_variant["real_price"];
  }

  $basket_variant["total_price"] = $total_price;

  $totalBasketCost += $total_price;

  $basket_variants[$basket_variant_index] = $basket_variant;
}

$user_basket["variants"] = $basket_variants;
$user_basket["total_basket_cost"] = $totalBasketCost;
$user_basket["item_count"] = $item_count;

$app["user"]["basket"] = $user_basket;
