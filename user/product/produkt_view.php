<div class="mobileRow productWrapper" style="max-width: 1350px;margin: 10px auto;width: 100%;">
  <div style="width: 50%;margin: 32px auto 0;">
    <?php if (count($gallery) == 1) : ?>
      <img style='max-width:100%' data-src='<?= $product_data["cache_thumbnail"] ?>' data-height='1w' class='product-image'>
    <?php else : ?>
      <div class="swiper-container product-main-slider">
        <div class="swiper-wrapper">
          <?= $galleryhtml ?>
        </div>
        <div class="swiper-button-next"><img src="/img/chevron.svg"></div>
        <div class="swiper-button-prev"><img src="/img/chevron.svg"></div>
      </div>
      <div class="swiper-container gallery-thumbs">
        <div class="swiper-wrapper">
          <?= $gallerythumbshtml ?>
        </div>
      </div>


    <?php endif ?>
  </div>
  <div style="width: 40%; box-sizing: border-box; margin-top: 20px">
    <div style="max-width: 450px; padding: 0 10px" class="mobileCenter">
      <h1 class="h1"><?= $product_data["title"] ?>
        <?php if ($product_data["published"] != 1) : ?>
          (Ukryty!)
        <?php endif ?>
      </h1>

      <?php if ($app["user"]["priveleges"]["backend_access"]) : ?>
        <a href="/admin/produkt/<?= $number ?>" style="position:relative;top:-20px;" class="btn primary medium">Edytuj</a>
      <?php endif ?>

      <div class="sameButtons">

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

          <div style="display:inline-block;cursor:pointer" data-tooltip="Przejdź do komentarzy" data-position="center" onclick='scrollToView($(".comments"),{margin:0.5,duration:100})'>
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
        <button id="buyNow" class="btn primary big fill" onclick="addItem(VARIANT_ID,1)">
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
            <button id="notify" class="btn primary big fill" onclick="sendNotification()">
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

<div style="width: 100%;max-width: 1500px;margin: 50px auto; padding:10px; box-sizing:border-box">
  <div style="align-items:flex-start;justify-content:space-evenly" class="mobileRow">
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
  </div>

  <div class="cms" style="margin:50px -10px;width: auto;"><?= getCMSPageHTML($product_data["description"]); ?></div>

  <h3 style="padding:12px 0;margin:30px 0 10px" id="opinieLabel"></h3>

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
    <div id="formComment">
      <?php
      $input = ["product_id" => $number];
      include 'helpers/order/can_user_get_comment_rebate.php';

      if ($can_user_get_comment_rebate) {
        echo '<h4 class="link" style="font-size: 18px;margin: 5px 0;">Dodaj komentarz, a w zamian otrzymasz kod rabatowy o wartości 25 zł <i class="fas fa-comments-dollar" style="font-size: 32px;vertical-align: bottom;margin: 2px;"></i></h4>';
      }
      ?>

      <h4 style="font-size: 16px; margin: 20px 0 10px">
        Twoja ocena
        <div class="rating my-rating">
          <span><img src="/img/star-gray.png"></span>
          <span><img src="/img/star-gray.png"></span>
          <span><img src="/img/star-gray.png"></span>
          <span><img src="/img/star-gray.png"></span>
          <span><img src="/img/star-gray.png"></span>
        </div>
      </h4>
      <label>
        <input type="text" id="pseudonim" placeholder="Pseudonim" style="padding: 3px 5px;width:180px;" value="<?= isset($pseudonim) ? $pseudonim : "" ?>">

      </label>
      <textarea id="tresc" data-required placeholder="Treść komentarza" style="padding: 3px 5px;box-sizing: border-box;display:block;width:100%;height:150px;min-height:100px;max-height:200px;resize:vertical;margin-top:8px"></textarea>
      <button class="btn primary medium" onclick="newComment()" style="margin:8px 0 8px auto;display: block">Wyślij <i class="fas fa-paper-plane"></i></button>
    </div>
    <div id="commentSent" style="display:none">
      <h3>Dziękujemy za przekazaną opinię!</h3>
    </div>
  <?php else : ?>
    <p style="font-size:16px;">
      Żeby dodać opinię musisz najpierw się zalogować
      <a href="/logowanie/" class="primary-link">tutaj</i></a>
    </p>
  <?php endif ?>
</div>

<div class="old-popupWrapper">
  <div class="old-popup">
    <h3 style="margin: 0 0 19px;text-align:center;font-size:20px">Dodano produkt do koszyka</h3>
    <div style="display:flex" class="mobileRow">
      <div class="item-image marginAuto" id="updateChoosenImage" style="min-height: 140px;margin-right: 20px;height: auto;"></div>
      <div style="display: flex;flex-direction: column;justify-content: center;width: 55%;">
        <div style="font-size: 14px;display: flex;align-items: center;min-height: 80px;">
          <div>
            <?= $product_data["title"] ?>
            <span id="updateChoosenVariant" style="text-transform: lowercase;"></span>
            <div id="updateChoosenAmountCost" class="pln" style="text-align: center;font-size: 20px;display: inline-block;position: relative;top: 1px;left: 2px;"></div>
          </div>
        </div>
        <div class="btn primary big fill" style="margin: 10px 0" onclick="hidePopup()">
          Kontynuuj zakupy
        </div>
        <a href="/zakup" class="btn primary big fill" style="margin-bottom: 6px">
          Kup teraz
        </a>
      </div>
    </div>
  </div>
</div>