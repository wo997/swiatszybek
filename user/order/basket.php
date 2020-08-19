<?php //route[basket]

$urlParts = explode("/", $url);

$basket = json_decode($_SESSION["basket"], true);

$request = $urlParts[1];

$basket_variant_limit = 10;

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

$basket_string = json_encode($basket);

setBasketData($basket_string);

if ($_SERVER["REQUEST_METHOD"] == "POST") {

  require "helpers/order/get_basket_data.php"; // refresh data

  $response = [];

  $response["basket"] = $basket;

  $response["basket_content_html"] = getBasketContent();

  $response["basket_table_html"] = printBasketTable();
  $response["total_basket_cost"] = $app["user"]["basket"]["total_basket_cost"];
  $response["item_count"] = $app["user"]["basket"]["item_count"];

  die(json_encode($response));
}
