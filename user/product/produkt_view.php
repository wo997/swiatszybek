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
      <h1 class="h1"><?= $product_data["title"] ?>
        <?php if ($product_data["published"] != 1) : ?>
          (Ukryty!)
        <?php endif ?>
      </h1>

      <?php if ($app["user"]["priveleges"]["backend_access"]) : ?>
        <a href="/admin/produkt/<?= $number ?>" style="position:relative;top:-20px;" class="btn primary medium">Edytuj <i class="fas fa-cog"></i></a>
      <?php endif ?>

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

            <span style="font-size:15px;">(<?php
                                            function ileOcen($n)
                                            {
                                              if ($n == 0) return "Brak ocen";
                                              if ($n == 1) return "$n ocena";
                                              if ($n > 1 && $n < 5) return "$n oceny";
                                              return "$n ocen";
                                            }
                                            echo ileOcen($product_data["cache_rating_count"]);
                                            ?>)</span>

          </div>
        </h3>

        <p style='font-weight:normal;margin:0;font-size: 1.1em;' id="quantity"></p>

        <p style='font-weight:normal;margin:0;font-size: 1.1em;'>Kurier: <span class="pln"><?= config('kurier_cena', 0) ?> zł</span>, Paczkomat: <span class="pln"><?= config('paczkomat_cena', 0) ?> zł</span>, Odbiór osobisty: <span class="pln">0 zł</span></p>

        <p style='font-weight:normal;margin:0;font-size: 1.1em;'>
          <span class="caseMore">Czas realizacji: <span class="pln">24h</span></span>
          <b class="caseZero">Na zamówienie</b>
        </p>


        <div style="height:20px"></div>
        <button id="buyNow" class="btn primary medium fill" onclick="addItemToBasket(VARIANT_ID,1)">
          Dodaj do koszyka
          <i class="fa fa-check" style="font-size: 14px;vertical-align: middle;"></i>
        </button>

        <div id="juzMasz"></div>

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
  <!--<div style="align-items:flex-start;justify-content:space-evenly" class="mobileRow">
    <section style="width:98%;margin:0 1%;max-width:450px" class="expandClick">
      <div class="expandHeader">
        <h3 style="margin:0">Opis produktu <i class="fas fa-plus"></i><i class="fas fa-minus"></i></h3>
      </div>
      <div class="expandContent">
        <div class="short-description ql-editor"><?= "" ?></div>
        <p style='font-weight:normal;margin-top: 0;' id="productCode"></p>
      </div>
    </section>

    <section style="width:98%;margin:0 1%;max-width:450px" class="expandClick">
      <div class="expandHeader">
        <h3 style="margin:0">Specyfikacja <i class="fas fa-plus"></i><i class="fas fa-minus"></i></h3>
      </div>
      <div class="expandContent">
        <?= "" ?>
      </div>
    </section>
  </div>-->

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
    $stmt = $con->prepare("SELECT pseudonim FROM users WHERE user_id = ?");
    $stmt->bind_param("s", $app["user"]["id"]);
    $stmt->execute();
    $stmt->bind_result($pseudonim);
    mysqli_stmt_fetch($stmt);
    $stmt->close();
    ?>
    <div id="formComment" data-form>
      <h4 style="font-size: 22px; margin: 70px 0 10px;">Podziel się swoją opinią</h4>
      <?php
      $input = ["product_id" => $number];
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
        <input type="text" class="field pseudonim" value="<?= isset($pseudonim) ? $pseudonim : "" ?>">
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

<div id="productAdded" data-form data-modal data-dismissable>
  <div class="modal-body">
    <button class="fas fa-times close-modal-btn"></button>

    <h3 class="header">Dodano do koszyka</h3>

    <div style="display:flex;padding: min(2vw,15px);align-items: center;" class="mobileRow">
      <img class="marginAuto" id="updateChoosenImage" style="width:100%;object-fit:contain;margin-right: 20px;" data-height="1w">
      <div style="width: 55%;max-width: 300px;">
        <div style="font-size: 14px;display: flex;align-items: center;min-height: 80px;">
          <div>
            <?= $product_data["title"] ?>
            <span id="updateChoosenVariant" style="text-transform: lowercase;"></span>
            <div id="updateChoosenAmountCost" class="pln" style="text-align: center;font-size: 20px;display: inline-block;position: relative;top: 1px;left: 2px;"></div>
          </div>
        </div>
        <div class="btn primary medium fill" style="margin: 10px 0" onclick="hideParentModal(this)">
          Kontynuuj zakupy
        </div>
        <a href="/zakup" class="btn primary medium fill" style="margin-bottom: 6px">
          Kup teraz
        </a>
      </div>
    </div>
  </div>
</div>