<?php //route[basket]

$urlParts = explode("/", $url);

$basket = json_decode($_SESSION["basket"], true);

$request = $urlParts[1];

$basket_variant_limit = 100;

if ($request == "add") {
  $variant_id = intval($urlParts[2]);
  if ($variant_id == 0) die;
  $quantity = intval($urlParts[3]);
  if ($quantity <= 0) die;

  if ($quantity > $basket_variant_limit) $quantity = $basket_variant_limit;

  $variant_found = false;
  foreach ($basket as $basket_item_id => $basket_item) {
    if ($basket[$basket_item_id]["variant_id"] == $variant_id) {
      $variant_found = true;
      $basket[$basket_item_id]["quantity"] += $quantity;
      if ($basket[$basket_item_id]["quantity"] > $basket_variant_limit) {
        $basket[$basket_item_id]["quantity"] = $basket_variant_limit;
      }
      break;
    }
  }

  if (!$variant_found) {
    $basket[] = [
      "variant_id" => $variant_id,
      "quantity" => $quantity
    ];
  }
} else if ($request == "remove") {
  $variant_id = intval($urlParts[2]);
  if ($variant_id == 0) die;
  $quantity = intval($urlParts[3]);
  if ($quantity <= 0) die;

  foreach ($basket as $basket_item_id => $basket_item) {
    if ($basket_item["variant_id"] == $variant_id) {
      $basket[$basket_item_id]["quantity"] -= $quantity;
      if ($basket[$basket_item_id]["quantity"] < 1) {
        unset($basket[$basket_item_id]);
      }
      break;
    }
  }
} else die;

setBasketData($basket);

validateStock();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  json_response(getBasketDataAll());
}
