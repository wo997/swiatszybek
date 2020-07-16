<?php //->[basket]

$urlParts = explode("/",$url);

if (empty($_SESSION["basket"]))
  $_SESSION["basket"] = "";

$basket = json_decode($_SESSION["basket"],true);

$request = $urlParts[1];

if ($request == "add")
{
  $variant_id = intval($urlParts[2]);
  if ($variant_id == 0) die;
  $quantity = intval($urlParts[3]);
  if ($quantity == 0) die;

  if (isset($basket[$variant_id]))
    $basket[$variant_id] += $quantity;
  else
    $basket[$variant_id] = $quantity;

  if ($basket[$variant_id] > 10) // top limit
  {
    $basket[$variant_id] = 10;
  }
  $sayBasket = true;
}
else if ($request == "remove")
{
  $variant_id = intval($urlParts[2]);
  if ($variant_id == 0) die;
  $quantity = intval($urlParts[3]);
  if ($quantity == 0) die;

  if (isset($basket[$variant_id]))
    $basket[$variant_id] -= $quantity;

  if ($basket[$variant_id] < 1)
  {
    unset($basket[$variant_id]);
  }

  $sayBasket = true;
}
else if ($request == "set")
{
  $basket = json_decode($urlParts[2],true); // prevent sql injection and so on
  foreach ($basket as $variant => $amount)
  {
    if ($amount <= 0)
    {
      unset($basket[$variant]);
    }
  }
}
else die;

$basket_string = json_encode($basket);

$_SESSION["basket"] = $basket_string;
setcookie("basket", $basket_string, (time() + 31536000) , '/');

if ($app["user"]["id"]) {
  
  query("UPDATE users SET basket = ? WHERE user_id = ?", [
    $basket_string, $app["user"]["id"]
  ]);
}

if ($_SERVER["REQUEST_METHOD"] == "POST")
{
  if (isset($_POST['html']))
  {
    require "print_basket_nice.php";
    echo json_encode([
      "html" => $res,
      "totalBasketCost" => $totalBasketCost
    ]);
    die;
  }
  else if (isset($sayBasket))
  {
    include "basketContent.php";
    
    $basket_ids = array_keys($basket);
    $basket_counts = array_values($basket);

    echo json_encode([
      "basket_ids" => $basket_ids,
      "basket_counts" => $basket_counts, 
      "basketContent" => $basketContent
    ]);
    die;
  }
}
else
{
  header("Location: /koszyk/$specificTime"); // unused
  die;
}
