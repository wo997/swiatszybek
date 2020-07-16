<?php

$basket = json_decode($_SESSION["basket"],true);

$basket_ids = array_keys($basket);
$inBasket = implode(",",$basket_ids);
$variants_id_list = [];
if ($inBasket) {
  $variants = fetchArray("SELECT variant_id, product_id, title, link, name, zdjecie, price, rabat, quantity as stock
  FROM products i INNER JOIN variant v USING (product_id) WHERE variant_id IN ($inBasket)");

  foreach($variants as &$variant) {
    $variants_id_list[] = $variant["variant_id"];
    $variant["price_real"] = $variant["price"] - $variant["rabat"];
  }
  unset($variant);
}

$totalBasketCost = 0;

foreach ($basket_ids as $basket_variant_id)
{
  $empty = false;
  $index = array_search($basket_variant_id,$variants_id_list);
  
  $variants[$index]["quantity"] = $basket[$basket_variant_id];

  $v = $variants[$index];
  $basket_product_id = $v["product_id"];
  $basket_price0 = $v["price"];
  $basket_rabat = $v["rabat"];
  $quantity = $v["quantity"];

  $basket_price = 0;

  $basket_product_id_count = [];

  $item_count = 0;
  for ($i=0;$i<$quantity;$i++)
  {
    if (!isset($basket_product_id_count[$basket_product_id])) {
      $basket_product_id_count[$basket_product_id] = 0; 
    }
    $basket_product_id_count[$basket_product_id]++;
    $c = $basket_product_id_count[$basket_product_id];

    /*if ($basket_different) {
      if ($c == 1) $basket_price += $basket_price1;
      else if ($c == 2) $basket_price += $basket_price2;
      else $basket_price += $basket_price3;
    }
    else {
      
    }*/
    $basket_price += $basket_price0;
    $basket_price -= $basket_rabat;
  }
  $variants[$index]["final_price"] = $basket_price;

  $totalBasketCost += $basket_price;
  $item_count++;
}

