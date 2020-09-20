<?php //route[produkt]

function run()
{
  header("Location: /");
  die;
}

$parts = explode("/", $url);
if (isset($parts[1]))
  $number = intval($parts[1]);
else {
  run();
}

if (isset($_POST["preview_params"])) {
  $preview_params = json_decode($_POST["preview_params"], true);
}

//$cansee = $app["user"]["priveleges"]["backend_access"] ? "" : "AND published = 1";
//$product_data = fetchRow("SELECT product_id, title, link, seo_title, seo_description, description, specyfikacja_output, descriptionShort, price_min, price_max, image, published, cache_avg_rating, cache_rating_count FROM products WHERE product_id = $number");

$product_data = fetchRow("SELECT * FROM products WHERE product_id = $number");
if (isset($preview_params)) {
  $product_data = array_merge($product_data, $preview_params);
}

if (!$product_data) {
  run();
}

if ((!isset($parts[2]) || $parts[2] != $product_data["link"]) && $product_data["link"]) {
  header("Location: " . getProductLink($product_data["product_id"], $product_data["link"]));
  die;
}

$priceText = $product_data["price_min"];
if (!empty($product_data["price_max0"]) && $product_data["price_min"] != $product_data["price_max0"])
  $priceText .= " - " . $product_data["price_max0"];

//$variants = fetchArray("SELECT variant_id, name, product_code, price, rabat, color, zdjecie, zdjecia, quantity FROM variant v WHERE product_id = $number AND published = 1 ORDER BY v.kolejnosc");
$variants = fetchArray("SELECT * FROM variant WHERE product_id = $number AND published = 1 ORDER BY kolejnosc");

if (isset($preview_params)) {
  $variants = json_decode($preview_params["variants"], true);
}



$anyVariantInStock = false;
foreach ($variants as $variant) {
  if ($variant["stock"] > 0) {
    $anyVariantInStock = $variant["variant_id"];
    break;
  }
}

$gallery = json_decode($product_data["gallery"], true);
if (!$gallery) {
  $gallery = [];
}

$galleryhtml = "";
$gallerythumbshtml = "";
foreach ($gallery as $pic) {
  $galleryhtml .= "<div class='swiper-slide'><img style='max-width:100%' data-src='" . $pic["values"]["src"] . "' data-height='1w' class='swiper-slide product-image'></div>";
  $gallerythumbshtml .= "<img style='max-width:100%' data-src='" . $pic["values"]["src"] . "' data-height='1w' class='swiper-slide product-image'>";
}



$seo_description = $product_data["seo_description"];
$seo_title = $product_data["seo_title"];

$stockSchema = $anyVariantInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
?>
<!DOCTYPE html>
<html lang="pl">

<head>
  <title><?= $product_data["seo_title"] ?></title>
  <meta name="description" content="<?= $seo_description ?>">
  <?php include "global/includes.php";
  include "global/includes_for_cms_page.php";
  ?>

  <meta name="image" content="/uploads/sm<?= getUploadedFileName($product_data["cache_thumbnail"]) ?>" />
  <meta property="og:image" content="/uploads/sm<?= getUploadedFileName($product_data["cache_thumbnail"]) ?>">
  <!--<meta property="og:image:type" content="image/png">-->
  <meta name="description" content="<?= $seo_description ?>">
  <meta property="og:title" content="<?= $seo_title ?> - <?= config('main_email_sender') ?>" />
  <meta property="og:description" content="<?= $seo_description ?>" />
  <meta property="og:site_name" content="<?= $seo_description ?>" />
  <meta name="twitter:description" content="<?= $seo_description ?>" />
  <meta name="twitter:title" content="<?= $seo_title ?>" />

  <script src="/builds/product.js?v=<?= JS_RELEASE ?>"></script>
  <link href="/builds/product.css?v=<?= CSS_RELEASE ?>" rel="stylesheet">

  <style>

  </style>
  <script>
    var variants = <?= json_encode($variants) ?>;
    const PRODUCT_ID = <?= $product_data["product_id"] ?>;
  </script>

  <?php if ($product_data["cache_rating_count"] > 0) : ?>
    <script <?= 'type="application/ld+json"' ?>>
      {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "<?= htmlspecialchars($product_data["title"]) ?>",
        "url": "<?= SITE_URL . "/" . $url ?>",
        "image": [
          "<?= $product_data["cache_thumbnail"] ?>"
        ],
        "description": "<?= $product_data["seo_description"] ?>",
        "brand": {
          "@type": "Thing",
          "name": "<?= config('main_email_sender') ?>"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "<?= $product_data["cache_avg_rating"] ?>",
          "reviewCount": "<?= $product_data["cache_rating_count"] ?>",
          "bestRating": 5,
          "worstRating": 0
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "PLN",
          "price": "<?= $product_data["price_min"] ?>",
          "itemCondition": "https://schema.org/UsedCondition",
          "availability": "<?= $stockSchema ?>",
          "seller": {
            "@type": "Organization",
            "name": "<?= config('main_email_sender') ?>"
          }
        }
      }
    </script>
  <?php endif ?>
</head>

<body>

  <?php
  include "global/header.php";

  if ($product_data["published"] || $app["user"]["priveleges"]["backend_access"] || $preview_params) {
    include "produkt_view.php";
  } else {
    echo '<div class="centerVerticallyMenu" style="text-align:center">
          <h2>Produkt jest niedostępny!</h2>
          <p style="font-size:18px">Wróć na <a href="/" class="primary-link">stronę główną</a></p>
        </div>';
  }

  include "global/footer.php";
  ?>
</body>

</html>