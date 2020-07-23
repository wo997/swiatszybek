<?php

$basketContent = "";

if (!$app["user"]["basket"]["item_count"])
{
  $basketContent = "<h5 style='text-align:center'>Twój koszyk jest pusty!</h5>";
}
else
{
  foreach($basket_variants as $basket_variant_index => $basket_variant) {
    if ($basketContent == "") $basketContent = "<div class='basketSplit'><div class='basketItemsWrapper'><div class='scrollableContent'>";

    $basket_name = $basket_variant["name"];
    $basket_quantity = $basket_variant["quantity"];
    $basket_quantity = $basket_quantity > 1 ? " - $basket_quantity szt." : "";

    $title_html = "<span style='font-size:16px'>".$basket_variant["title"]."</span>";
    if (!empty($basket_name))
      $title_html .= "<br><span style='font-size:15px'>".$basket_variant["name"]."</span>";

    $basketContent .= "<div><a href='".getProductLink($basket_variant["product_id"],$basket_variant["link"])."'><div class='item-image' style='background-image:url(\"/uploads/df/".$basket_variant["zdjecie"]."\")'></div><div class='item-desc'><span><h3>$title_html<b>".$basket_quantity."</b></h3><span class='pln'>".$basket_variant["total_price"]." zł</span></span></div></a></div>";
  }

  $basketContent .=
    '</div></div><div><a class="btn primary big fill" href="/zakup" style="position:relative">
      Przejdź do kasy
      <i class="fa fa-chevron-right"></i>
    </a></div></div>';
}
