<?php

$basketContent = "";
$basket = json_decode($_SESSION["basket"],true);
$amount = 0;

//$basketInfo = []; cmon use it baby

if (empty($basket))
{
  $basketContent = "<h5 style='text-align:center'>Twój koszyk jest pusty!</h5>";
}
else
{
  require "get_basket_data.php";

  foreach ($basket_ids as $variant_id)
  {
    if ($basketContent == "") $basketContent = "<div class='basketSplit'><div class='basketItemsWrapper'><div class='scrollableContent'>";

    $v = $app["user"]["basket"]["variants"][array_search($variant_id,$app["user"]["basket"]["variant_id_list"])];
    $basket_name = $v["name"];
    $basket_quantity = $v["quantity"];

    $amount++;

    $basket_quantity = $basket_quantity > 1 ? " - $basket_quantity szt." : "";

    $title_html = "<span style='font-size:16px'>".$v["title"]."</span>";
    if (!empty($basket_name))
      $title_html .= "<br><span style='font-size:15px'>".$v["name"]."</span>";

    $basketContent .= "<div><a href='".getProductLink($v["product_id"],$v["link"])."'><div class='item-image' style='background-image:url(\"/uploads/df/".$v["zdjecie"]."\")'></div><div class='item-desc'><span><h3>$title_html<b>".$basket_quantity."</b></h3><span class='pln'>".$v["total_price"]." zł</span></span></div></a></div>";
  }

  $basketContent .=
    '</div></div><div><a class="btn primary big fill" href="/zakup" style="position:relative">
      Przejdź do kasy
      <i class="fa fa-chevron-right"></i>
    </a></div></div>';
}
