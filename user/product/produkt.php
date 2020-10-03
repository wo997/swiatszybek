<?php //route[produkt]

$parts = explode("/", $url);
if (isset($parts[1]))
  $product_id = intval($parts[1]);
else {
  redirect("/");
}

if (isset($_POST["preview_params"])) {
  $preview_params = json_decode($_POST["preview_params"], true);
}

$product_data = fetchRow("SELECT * FROM products WHERE product_id = $product_id");
if (isset($preview_params)) {
  $product_data = array_merge($product_data, $preview_params);
}

if (!$product_data) {
  redirect("/");
}

if ((!isset($parts[2]) || $parts[2] != $product_data["link"]) && $product_data["link"]) {
  header("Location: " . getProductLink($product_data["product_id"], $product_data["link"]));
  die;
}

$priceText = $product_data["price_min"];
if (!empty($product_data["price_max0"]) && $product_data["price_min"] != $product_data["price_max0"])
  $priceText .= " - " . $product_data["price_max0"];

$variants = fetchArray("SELECT * FROM variant WHERE product_id = $product_id AND published = 1 ORDER BY kolejnosc");

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

$page_data["seo_description"] = $product_data["seo_description"];
$page_data["seo_title"] = $product_data["seo_title"];
$page_data["seo_image"] = "/uploads/sm" . getUploadedFileName($product_data["cache_thumbnail"]) . ".jpg";

$stockSchema = $anyVariantInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
?>

<?php startSection("head"); ?>
<?php
include "global/includes_for_cms_page.php";
?>

<script src="/builds/product.js?v=<?= JS_RELEASE ?>"></script>
<link href="/builds/product.css?v=<?= CSS_RELEASE ?>" rel="stylesheet">

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

<?php startSection("content"); ?>

<?php
if ($product_data["published"] || $app["user"]["priveleges"]["backend_access"] || $preview_params) :
?>

  <div class="mobileRow productWrapper" style="max-width: 1350px;margin: 10px auto;width: 100%;">
    <div style="width: 50%;margin: 32px auto 0;">
      <?php if (count($gallery) == 1) : ?>
        <img style='max-width:100%' data-src='<?= $product_data["cache_thumbnail"] ?>' data-height='1w' class='product-image'>
      <?php else : ?>
        <div class="swiper-container product-main-slider">
          <div class="swiper-wrapper">
            <?= $galleryhtml ?>
          </div>
          <div class="swiper-nav swiper-button-next"><img src="/img/chevron.svg"></div>
          <div class="swiper-nav swiper-button-prev"><img src="/img/chevron.svg"></div>
        </div>
        <div class="swiper-container gallery-thumbs">
          <div class="swiper-wrapper">
            <?= $gallerythumbshtml ?>
          </div>
        </div>


      <?php endif ?>
    </div>
    <div style="width: 40%; margin-top: 20px">
      <div style="max-width: 450px; padding: 0 10px" class="mobileCenter">
        <h1 class="h1"><?= $product_data["title"] ?></h1>

        <div>

          <div class="variants">
            <?php

            for ($i = 0; $i < count($variants); $i++) {
              $color = empty($variants[$i]['color'])  ? "" : "<b class='colour' style='background:{$variants[$i]['color']}'></b>";

              $scroll_to_image = "onclick='clickVariant({$variants[$i]['variant_id']})'";

              $wyprz = $variants[$i]['rabat'] > 0 ? "<div class='percentOff'>-" . round($variants[$i]['rabat']) . " zł</div>" : "";

              $small_font = strlen($variants[$i]['name']) > 28 ? "small_font" : "";

              echo "<div class='color $small_font'><label><input type='radio' class='option' name='variant' value='{$variants[$i]['variant_id']}'><div class='boxy' $scroll_to_image>$color{$variants[$i]['name']}</div>$wyprz</label></div>";
            }

            ?>
          </div>

          <h3 style='font-weight:normal;margin-bottom: 0;    font-size: 22px;'>
            <span>Cena: </span><span id="priceText" class="pln"><?= $priceText ?></span> <span class="pln">zł</span> <span id="wasPrice" class='slash'></span> <span id="kolejnyTaniej"></span>

            <div style="display:inline-block;cursor:pointer" data-tooltip="Przejdź do komentarzy" data-position="center" onclick='scrollToView($(".comments"),{margin:0.5,duration:70})'>
              <?= ratingBlock($product_data["cache_avg_rating"]); ?>

              <span style="font-size:15px;">
                (<?php
                  function ileOcen($n)
                  {
                    if ($n == 0) return "Brak ocen";
                    if ($n == 1) return "$n ocena";
                    if ($n > 1 && $n < 5) return "$n oceny";
                    return "$n ocen";
                  }
                  echo ileOcen($product_data["cache_rating_count"]);
                  ?>)
              </span>
            </div>
          </h3>

          <p style='font-weight:normal;margin:0;font-size: 1.1em;' id="quantity"></p>

          <p style='font-weight:normal;margin:0;font-size: 1.1em;'>Kurier: <span class="pln"><?= config('kurier_cena', 0) ?> zł</span>, Paczkomat: <span class="pln"><?= config('paczkomat_cena', 0) ?> zł</span>, Odbiór osobisty: <span class="pln">0 zł</span></p>

          <p style='font-weight:normal;margin:0;font-size: 1.1em;'>
            <span class="caseMore">Czas realizacji: <span class="pln">24h</span></span>
            <b class="caseZero">Na zamówienie</b>
          </p>


          <div style="height:20px"></div>
          <button id="buyNow" class="btn primary medium fill" onclick="addVariantToBasket(VARIANT_ID,1,{show_modal:true,modal_source:this})">
            Dodaj do koszyka
            <i class="fa fa-check" style="font-size: 14px;vertical-align: middle;"></i>
          </button>

          <div class="expand_y hidden animate_hidden case_basket_not_empty wtwoimkoszyku" data-product_id="<?= $product_id ?>"></div>
          <div class="product_basket_variants" data-product_id="<?= $product_id ?>"></div>
          <div class="expand_y hidden animate_hidden case_basket_not_empty" data-product_id="<?= $product_id ?>">
            <a class="btn primary medium fill" href="/zakup" style="margin-top: 20px">
              Przejdź do koszyka
              <i class="fa fa-chevron-right"></i>
            </a>
          </div>

          <div style="margin-top: 13px;display:none" id="caseZero">
            <div id="hideWhenNotificationAdded">
              <div style="margin:12px 0 0;display:none" id="caseLast">Dodałaś/eś do koszyka <b>ostatnią szukę!</b><span> Chcesz kolejną?</span></div>
              <h3 style="margin:12px 0 0">Wyślij powiadomienie o dostępności</h3>
              <label style="font-size:16px;margin: 10px 0;display: flex;align-items: center;">
                <span>Twój e-mail: </span>
                <input type="text" value="<?= $app["user"]["email"] ?>" id="notification_email" style="width: auto;flex-grow: 1;margin-left: 10px;padding: 1px 4px;">
              </label>
              <button id="notify" class="btn primary medium fill" onclick="sendNotification()">
                Potwierdź powiadomienie
                <i class="fa fa-envelope" style="font-size: 14px;"></i>
              </button>
            </div>
            <p id="whenNotificationAdded" style="display:none;color: white; background: #1b1; border-radius: 3px; padding: 3px 10px;text-align:center;max-width:450px;">Wyślemy powiadomienie na <span id="user_email"></span> kiedy produkt pojawi się w sklepie <i class="fa fa-envelope"></i></p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div style="width: 100%;max-width: 1500px;margin: 50px auto; padding:10px;">
    <div class="cms" style="margin:50px -10px;width: auto;"><?= getCMSPageHTML($product_data["description"]); ?></div>

    <h3 style="margin:30px 0 30px;font-size:22px"><i class="fas fa-comments"></i> Komentarze</h3>

    <div class="comments">
      <?php
      $comments = fetchArray("SELECT dodano, pseudonim, tresc, user_id, comment_id, rating, accepted FROM comments WHERE product_id = " . $product_data["product_id"] . " AND accepted = 1");

      foreach ($comments as $comment) {
        echo '<div style="display:none">' . $comment["pseudonim"] . ' - ' . $comment["tresc"] . '</div>';
      }
      ?>
    </div>

    <?php if ($app["user"]["id"]) : ?>
      <?php
      $pseudonim = nonull("SELECT pseudonim FROM users WHERE user_id = " . intval($app["user"]["id"]), "");
      ?>
      <div id="formComment" data-form>
        <h4 style="font-size: 22px; margin: 70px 0 10px;">Podziel się swoją opinią</h4>
        <?php
        $input = ["product_id" => $product_id];
        include 'helpers/order/can_user_get_comment_rebate.php';

        if ($can_user_get_comment_rebate) {
          echo '<h4 class="rebate-info">W nagrodę otrzymasz kod rabatowy o wartości 25 zł <i class="fas fa-comments-dollar" style="font-size: 26px;margin: -8px 0;"></i></h4>';
        }
        ?>
        <div style="height:10px"></div>
        <div class="field-title">
          Ocena
        </div>
        <div class="rating my-rating" style="margin:0;font-size: 20px;">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <label>
          <div class="field-title">Pseudonim</div>
          <input type="text" class="field pseudonim" value="<?= $pseudonim ?>">
        </label>

        <label>
          <div class="field-title">Komentarz</div>
          <textarea class="field tresc" data-validate style=height:150px;min-height:100px;max-height:200px;"></textarea>
        </label>

        <button data-submit class="btn primary medium block full-width-mobile" onclick="newComment()" style="margin:8px 0 8px auto;width:170px">Wyślij <i class="fas fa-paper-plane"></i></button>
      </div>
      <div id="commentSent" style="display:none">
        <p style="font-size:20px;font-weight:600;">Dziękujemy za przekazaną opinię!</p>
      </div>
    <?php else : ?>
      <p style="font-size:16px;">
        Zeby móc dodać komentarz musisz się zalogować
        <button class='btn subtle' onclick='showModal("loginForm",{source:this});hideParentModal(this)'>
          Zaloguj się <i class='fas fa-user'></i>
        </button>
      </p>
    <?php endif ?>
  </div>

<?php else : ?>
  <div class="centerVerticallyMenu" style="text-align:center">
    <h2>Produkt jest niedostępny!</h2>
    <p style="font-size:18px">Wróć na <a href="/" class="primary-link">stronę główną</a></p>
  </div>
<?php endif ?>

<?php if ($app["user"]["priveleges"]["backend_access"]) : ?>
  <div class="right_side_menu freeze_before_load">
    <button class="toggle-sidemenu-btn btn subtle" onclick="toggleRightSideMenu()">
      <i class="fas fa-chevron-right"></i>
      <i class="fas fa-cog"></i>
    </button>
    <div class="field-title first" style="font-size:1.2em;margin-top: 2px;text-align:center">Edycja</div>

    <?php if ($product_data["published"] === 1) {
      $clr = "var(--success-clr)";
      $info_label = "<i class='fas fa-eye'></i> Widoczny";
      $btn_label = 'Ukryj';
      $btn_class = 'secondary';
    } else {
      $clr = "var(--error-clr)";
      $info_label = "<i class='fas fa-eye-slash'></i> Ukryty!";
      $btn_label = 'Upublicznij';
      $btn_class = 'primary';
    }
    ?>

    <div style="color:<?= $clr ?>;margin:10px 0 5px;font-weight:600;text-align:center">
      <?= $info_label ?>
    </div>
    <button class="btn <?= $btn_class ?> fill" onclick="toggleProductPublish()"><?= $btn_label ?></button>

    <div style="height:10px"></div>

    <div>
      <a href="/admin/produkt/<?= $product_id ?>" class="btn primary fill">Więcej <i class="fas fa-cog"></i></a>
    </div>
  </div>

  <script>
    function toggleProductPublish() {
      xhr({
        url: "/admin/set_publish",
        params: {
          table: "products",
          primary: "product_id",
          primary_id: <?= $product_id ?>,
          published: <?= 1  - $product_data["published"] ?>,
        },
        success: () => {
          window.location.reload();
        },
      });
    }

    <?php if ($product_data["published"] == 0) : ?>
      domload(() => {
        toggleRightSideMenu();
      })
    <?php endif ?>
  </script>
<?php endif ?>

<?php include "user/default_page.php"; ?>