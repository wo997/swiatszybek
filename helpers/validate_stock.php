<?php

try
{
  $fail = false;
  foreach ($basket_ids as $variant_id)
  {
    $v = $variants[array_search($variant_id,$variants_id_list)];

    if ($v["quantity"] > $v["stock"])
    {
      $basket[$variant_id] = $v["stock"];
      $fail = true;
    }
  }
  if ($fail) {
    throw new Exception("out of stock");
  }
}
catch (Exception $e)
{
  $basket_string = json_encode(array_filter($basket));
  $_SESSION["basket"] = $basket_string;
  header("Location: /zakup?produkt=brak");
  die;
}