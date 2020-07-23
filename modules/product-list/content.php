  <?php

$shared_where = "published = 1";
$where = "WHERE ".$shared_where;

$productListCount = 8;
if (isset($moduleParams["productListCount"]))
{
  $productListCount = $moduleParams["productListCount"];
}

$join = "";
if (isset($moduleParams["category_id"]) && $moduleParams["category_id"] != 0)
{
  $join = " INNER JOIN link_product_category USING(product_id)";
  $where .= " AND category_id = " . intval($moduleParams["category_id"]);
}

$products = fetchArray("SELECT product_id, title, link, image, image_desktop, price_min, price_max, cache_avg_rating
FROM products i $join $where ORDER BY product_id DESC LIMIT ".intval($productListCount));

$total = 0;
$res = "";
foreach ($products as $product)
{
  $priceText = $product["price_min"];
  if (!empty($product["price_max"]) && $product["price_min"] != $product["price_max"])
    $priceText .= " - ".$product["price_max"];

  $priceText = preg_replace("/\.00/","",$priceText);

  $total++;
  
  if (!$product["image_desktop"]) {
    $product["image_desktop"] = $product["image"];
  }
  
  $res .= "<div class='product'>
            <a href='".getProductLink($product["product_id"],$product["link"])."'>
              <div class='item-image' style='background-image:url(\"/uploads/md/".$product["image"]."\")' data-desktop='/uploads/md/".$product["image_desktop"]."'></div>
              <div class='item-desc'><h3>".$product["title"]."</h3>
              <span class='pln'>$priceText zł</span>
              </div>".ratingBlock($product["cache_avg_rating"])."
              <div class='buynow btn'>KUP TERAZ</div>
            </a>
          </div>";
}

$module_content .= 
    "<div class='items count-$total'>$res</div>";

    $module_content .= "<style>
      div[data-module='product-list'] .product {width: 48%;}
      @media only screen and (max-width: 749px) {
        div[data-module='product-list'] .product {width: 98%;}
      }
      @media only screen and (min-width: 750px) {
        .items > div:not(:nth-child(3n)):not(:last-child) {
          border-right: 2px solid #eee;
        }
      }
    </style>";
?>