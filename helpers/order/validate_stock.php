<?php

try {
  $fail = false;

  foreach ($app["user"]["basket"]["variants"] as $basket_variant_index => $basket_variant) {
    if ($basket_variant["quantity"] > $basket_variant["stock"]) {
      $app["user"]["basket"]["variants"][$basket_variant_index]["quantity"] = $basket_variant["stock"];
      $fail = true;
    }
    if ($basket_variant["quantity"] <= 0) {
      unset($app["user"]["basket"]["variants"][$basket_variant_index]);
    }
  }
  $_SESSION["basket"] = json_encode(($app["user"]["basket"]["variants"]));
  if ($fail) {
    throw new Exception("out of stock");
  }
} catch (Exception $e) {
  if (!isset($_GET['produkt'])) { // cannot loop man
    header("Location: /zakup?produkt=brak");
    die;
  }
}
