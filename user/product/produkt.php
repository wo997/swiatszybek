<?php //->[produkt]

  $_SESSION["redirect"] = "/".$url;

  function run()
  {
    header("Location: /");
    die;
  }

  $parts = explode("/",$url);
  if (isset($parts[1]))
    $number = intval($parts[1]);
  else
  {
    run();
  }

  //$cansee = $app["user"]["is_admin"] ? "" : "AND published = 1";
  //$product_data = fetchRow("SELECT product_id, title, link, seo_title, seo_description, description, specyfikacja_output, descriptionShort, price_min, price_max, image, published, cache_avg_rating, cache_rating_count FROM products WHERE product_id = $number");
  
  $product_data = fetchRow("SELECT * FROM products WHERE product_id = $number");

  if (!$product_data)
  {
    run();
  }

  if ((!isset($parts[2]) || $parts[2] != $product_data["link"]) && $product_data["link"]) {
    header("Location: ".getProductLink($product_data["product_id"], $product_data["link"]));
    die;
  }

  $priceText = $product_data["price_min"];
  if (!empty($product_data["price_max0"]) && $product_data["price_min"] != $product_data["price_max0"])
    $priceText .= " - ".$product_data["price_max0"];

  //$variants = fetchArray("SELECT variant_id, name, product_code, price, rabat, color, zdjecie, zdjecia, quantity FROM variant v WHERE product_id = $number AND published = 1 ORDER BY v.kolejnosc");
  $variants = fetchArray("SELECT * FROM variant v WHERE product_id = $number AND published = 1 ORDER BY v.kolejnosc");

  $anyVariantInStock = false;
  foreach ($variants as $variant) {
    if ($variant["stock"] > 0)
    {
      $anyVariantInStock = $variant["variant_id"];
      break;
    }
  }
  /*while (mysqli_stmt_fetch($stmt))
  {
    $variants[] = [
      "variant_id" => $variant_id,
      "name" => htmlspecialchars($name),
      "product_code" => htmlspecialchars($product_code),
      "price" => $price,
      "rabat" => $rabat,
      "color" => htmlspecialchars($color),
      "zdjecie" => $zdjecie,
      "zdjecia" => $zdjecia,
      "amount" => $amount
    ];
    if ($amount > 0) {
      $doWeHaveAny = true;
    }
  }
  $stmt->close();*/

  function addPicture($url)
  {
    return "<div class='swiper-slide'><div class='item-image' style='background-image:url(\"/uploads/df/$url\")'></div></div>";
  }
  $variant_to_image = "";
  $gallery_urls = "";
  $gallery_urls_all = "";
  $first_pic = "";
  $pic_count = 0;
  $gallery = "";
  $variant_count = 0;

  $already_added_pics = [];

  $select_first_wyprzedaz_id = null;

  foreach ($variants as $v) {
    $zdjecia = explode(";",$v['zdjecie'].";".$v['zdjecia']);
    $main = true;
    foreach ($zdjecia as $z) {
      if ($z == "") continue;
      $gallery_urls_all .= "'$z',";
      if ($first_pic == "") $first_pic = $z;
      if (in_array($z, $already_added_pics))
      {
        $variant_to_image .= "-1,";
        continue;
      }
      $gallery .= addPicture($z);
      $already_added_pics[] = $z;
      if ($main)
      {
        $variant_to_image .= $pic_count.",";
        $gallery_urls .= "'$z',";
      }
      $main = false;
      $pic_count++;
    }
    $variant_count++;
  }

  if (!in_array($product_data["image"], $already_added_pics))
  {
    $gallery = addPicture($product_data["image"]) . $gallery;
    $already_added_pics = array_merge([$product_data["image"]],$already_added_pics);
    $pic_count++;
  }

  $variant_to_image = "[".rtrim($variant_to_image,",")."]";
  $gallery_urls = "[".rtrim($gallery_urls,",")."]";
  $gallery_urls_all = "[".rtrim($gallery_urls_all,",")."]";

  $justOne = $variant_count == 1;

  $des_seo = $product_data["seo_description"];


  $stockSchema = $anyVariantInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
?>

<!DOCTYPE html>
<html lang="pl">
  <head>
    <title><?=$product_data["seo_title"]?></title>
    <meta name="description" content="<?=$des_seo?>">
    <?php include "includes.php";include "include/includes_for_cms_page.php"; ?>

    <meta name="image" content="/uploads/md/<?=$product_data["image"]?>" />
    <meta property="og:image" content="/uploads/md/<?=$product_data["image"]?>">
    <meta property="og:image:type" content="image/png">
    <meta name="description" content="<?=$des_seo?>">
  	<meta property="og:title" content="<?=$title0?> - <?=config('main_email_sender')?>"/>
  	<meta property="og:description" content="<?=$des_seo?>"/>
  	<meta property="og:site_name" content="<?=$des_seo?>"/>
  	<meta name="twitter:description" content="<?=$des_seo?>"/>
  	<meta name="twitter:title" content="<?=$title0?>"/>

    <style>

      .comments th {
          display: none;
      }

      #buyNow {
          background: #f90;
          border-color: #e80;
      }

      .short-description {
          padding: 0;
          margin: 0.5em 0 1.2em;
      }

      .productWrapper h1 {
        margin: 50px auto 30px;
        /*font-size: 32px;*/
        max-width: 600px;
        text-align: left;
      }
      .item-image {
        height: 370px;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
        width: 100%;
      }
      .sameButtons .button {
        width: 100%;
      }
      .variants {
        margin-bottom: 25px;
        display: flex;
        flex-wrap: wrap;
      }
      .variant label {
        display: block;
        position: relative;
        padding: 5px 0;
      }
      .variant span {
        margin-left: 5px;
      }
      .variant input::before {
        content: "";
        width: 22px;
        height: 22px;
        content: "";
        border: 1px solid #888;
        display: inline-block;
        border-radius: 4px;
        background: #f5f5f5;
        vertical-align: middle;
      }
      .variant input:checked::before {
        background: #60c216;
        border-color: #26e;
      }
      .variant input:checked::after {
        content: "";
        position: absolute;
        display: block;
        left: 12px;
        top: 10px;
        width: 6px;
        height: 12px;
        border: solid white;
        border-width: 0 3px 3px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
      }
      .variant {
        width: 100%;
      }
      .color {
        <?php if ($variant_count == 3 || $variant_count > 4) : ?>
          width: 31.33333%;
        <?php else : ?>
          width: 48%;
        <?php endif ?>
        height: 100px;
        margin: 0 2% 2% 0;
        position: relative;
        user-select: none;
      }
      .color label {
        width: 100%;
        height: 100%;
      }
      .color input {
        display: none;
      }
      .color label > .boxy {
        width: 100%;
        height: 100%;
        border: 1px solid #bbb;
        display: flex !important;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        box-sizing: border-box;
        border-radius: 4px;
        cursor: pointer;
        transition: 0.1s;
        opacity: 0.8;
        position: relative;
      }
      .amount label > div > span {
        font-size: 20px;
        font-weight: normal;
      }
      .amount label > div {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
      .color input:checked + div {
        border: 2px solid #60c216;
        opacity: 1 !important;
      }
      .percentOff {
        position: absolute;
        right: -5px;
        top: 3px;
        width: 37px;
        text-align: center;
        padding: 2px 0;
        background: #f33;
        color: #FDD;
        font-size: 12px;
        border-radius: 2px;
        cursor: pointer;
      }
      .colour {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: block;
        margin: 5px auto;
        -webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.15), inset 0px 0px 5px 0px rgba(0,0,0,0.05), inset -1px 2px 2px 0px rgba(255,255,255,0.5);
        -moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.15), inset 0px 0px 5px 0px rgba(0,0,0,0.05), inset -1px 2px 2px 0px rgba(255,255,255,0.5);
        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.15), inset 0px 0px 5px 0px rgba(0,0,0,0.05), inset -1px 2px 2px 0px rgba(255,255,255,0.5);
      }

      .amount {
        display: flex;
        margin: 25px 0;
        font-size: 18px;
        user-select: none;
        line-height: 1.2;
      }
      .amount .color {
        height: 90px !important;
      }
      .locked {
        opacity: 0.3;
        cursor: auto !important;
      }
      .swiper-button-prev {
        left: 10px;
      }
      .swiper-button-next {
        right: 10px;
      }
      .swiper-pagination {
        font-size: 16px;
        position: relative;
        top: 6px;
        font-weight: bold;
      }
      .swiper-button-prev, .swiper-button-next{
        background: none;
        outline: none;
        opacity: 0.25;
      }
      .swiper-button-prev img, .swiper-button-next img {
        position: relative;
        left: -8px;
      }
      .swiper-slide {
        padding: 0 40px;
        box-sizing: border-box;
      }

      @media only screen and (max-width: 750px) {
        .marginAuto {
          margin: 10px auto !important;
        }
      }
      @media only screen and (max-width: 400px) {
        .percentOff {
          top: 2px !important;
          width: 35px !important;
          padding: 1px 0 !important;
        }
      }

      @media only screen and (min-width: 800px) and (max-width: 999px) {
        .item-image {
          height: 500px;
        }
      }
      @media only screen and (min-width: 1000px) {
        .item-image {
          height: 600px;
        }
        .popup {
          padding: 35px 20px;
        }
        
        #updateChoosenImage {
          max-width: 45%;
        }
      }
      @media only screen and (max-width: 450px) {
        .item-image {
          height: 300px;
        }
        .old-popupWrapper {
          padding: 10px;
        }
        .old-popup h3 {
          font-size: 18px !important;
        }
        .old-popup {
          text-align: center;
        }
      }

      .comment {
        padding: 8px 12px 12px;
      }
      .comment:nth-child(odd) {
        background: #eee;
      }
      .comment_header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }
      .pseudonim {
        font-size: 15px;
        font-weight: bold;
      }
      .dodano {
        margin-left: auto;
        color: #666;
        font-size: 0.9em;
      }
      form input, form textarea {
        border-radius: 0;
        padding: 3px;
        box-sizing: border-box;
      }
      .smallText {
        font-size:16px;
        color:#555;
      }
      .item-list td:first-child {
        width: auto !important;
      }
      .item-list tr {
        transition: 0.5s;
      }
      .seethrough {
        opacity: 0;
      }

      .item-list td:last-child {
        width: auto !important;
        text-align: right;
      }

      .taniej {
        background: #f33;
        color: white;
        font-size: 16px;
        display: inline-block;
        border-radius: 5px;
        padding: 1px 9px;
        vertical-align: middle;
        position: relative;
        top: -2px;
        margin: 4px;
      }

      #wasPrice {
        opacity: 0.7;
        transform: translateY(-1px) scale(0.8);
        display: inline-block;
      }

      .ql-editor {
        overflow: visible;
      }

      .color.small_font {
        font-size: 0.85em;
      }

      .small_font .colour {
        width: 26px;
        height: 26px;
      }
    </style>
    <script>

      var swiper;

      var RATING = 0;
      
      window.addEventListener("DOMContentLoaded",function(){
        if (document.querySelector('.swiper-container') != null)
        {
          swiper = new Swiper('.swiper-container', {
            pagination: {
              el: '.swiper-pagination',
              type: 'fraction',
            },
    	      navigation: {
    	        nextEl: '.swiper-button-next',
    	        prevEl: '.swiper-button-prev',
    	      },
          });
        }

        // rating
        var r = document.querySelectorAll(".my-rating span");
        for (i=0;i<r.length;i++)
        {
          r[i].setAttribute("data-rating", 5-i);
          r[i].addEventListener("click",function(){
            var rating = this.getAttribute("data-rating");
            RATING = rating;
            document.querySelector(".my-rating").className = "rating my-rating rating"+rating;
          });
        }
        var variantButtons = document.querySelectorAll(".boxy"); 
        for (var i = 0; i < variants.length; i++)
        {
          var variant = variants[i];

          var basket_item = user_basket.find(b => {return b.variant_id == variant.variant_id});
          variant.quantity = basket_item ? basket_item.quantity : 0;
          var left = variant.stock - variant.quantity;

          if (left > 0)
          {
            variantButtons[i].click();
            break;
          }
        }

        youAlreadyHaveIt();

        userBasketUpdated();
      });

      function userBasketUpdated() {
        for (basket_item of user_basket)
        {
          var variant = variants.find(v => {return v.variant_id == basket_item.variant_id});
          if (variant) {
            variant.quantity = basket_item.quantity;
          }
        }
      }

      function youAlreadyHaveIt(animate_variant_id = null) // optional
      {
        var juzMasz = "";
        var total = 0;
        for (basket_item of user_basket)
        {
          var variant = variants.find(v => {return v.variant_id == basket_item.variant_id});

          if (!variant) continue;

          var animate = animate_variant_id == basket_item.variant_id ? "style='animation: fadeOut 0.5s'" : "";

          var total_price = 0;
          for (p=0;p<basket_item.quantity;p++)
          {
            total_price += parseFloat(variant.price);
            total++;
          }

          var remove = `<button class='removeBtn' onclick='addItem(${basket_item.variant_id},-1)'>-</button>`;
          var add = `<button class='addBtn' ${basket_item.quantity <= 0 ? "style='visibility:hidden'" : ""} onclick='addItem(${basket_item.variant_id},1)'>+</button>`;

          juzMasz += `<tr ${animate}><td>${variant.name}</td><td class='oneline'>${remove}${basket_item.quantity} szt.${add}</td><td class='pln oneline'>${total_price} zł</td></tr>`;
        }

        clickVariant(VARIANT_ID);
        
        if (juzMasz != "")
        {
          juzMasz = "<h3 style='margin:25px 0 10px'>W Twoim koszyku już "+(total == 1 && false ? "jest" : "są")+":</h3><table class='item-list'>"+juzMasz+"</table>";
          juzMasz += `<a class="btn primary big fill" href="/zakup" style="margin-top: 20px">
                        Przejdź do koszyka
                        <i class="fa fa-chevron-right"></i>
                      </a>`;
        }
        document.getElementById("juzMasz").innerHTML = juzMasz;

        setTimeout(function(){
          removeClasses('seethrough');
        },10);
      }

      function addItem(variant_id, diff)
      {
        addItemtoBasket(variant_id, diff, (json) => {
          user_basket = json.basket;
          userBasketUpdated();
          
          user_basket = json.basket;

          youAlreadyHaveIt(variant_id);

          var variant = variants.find(v => {return v.variant_id == VARIANT_ID});
          if (diff == 1 && variant && variant.quantity == 1) {
            showPopup();
          }
        });
      }

      var variant_to_image = <?=$variant_to_image?>;
      var gallery_urls = <?=$gallery_urls?>;
      var gallery_urls_all = <?=$gallery_urls_all?>;
      var variants = <?=json_encode($variants)?>;
      var user_basket = <?=$_SESSION["basket"]?>;

      var VARIANT_ID = null;

      function clickVariant(variant_id)
      {
        document.getElementById("buyNow").toggleAttribute("disabled", true);

        if (!variant_id) return;

        var variant = variants.find(v => {return v.variant_id == variant_id});
        var basket_item = user_basket.find(b => {return b.variant_id == variant_id});
        variant.quantity = basket_item ? basket_item.quantity : 0;

        VARIANT_ID = variant_id;
        if (swiper != null && variant_to_image[VARIANT_ID] != -1)
          swiper.slideTo(variant_to_image[VARIANT_ID], 300, null);


        document.getElementById('updateChoosenImage').style.backgroundImage = `url('/uploads/df/${variant.zdjecie}')`;
        document.getElementById('updateChoosenVariant').innerHTML = " " + variant.name;
        document.getElementById('updateChoosenAmountCost').innerHTML = variant.price - variant.rabat + " zł";

        var left = variant.stock - variant.quantity;

        var low = left < 5 ? "style='font-weight:bold;color:red'" : "";

        document.getElementById("quantity").innerHTML = `Dostępność: <span class="pln" ${low}>${left} szt.</span>`;
        
        document.getElementById("buyNow").toggleAttribute("disabled", left == 0);

        document.getElementById("caseLast").style.display = left == 0 && variant.stock > 0 ? "block" : "none";
        document.getElementById("caseZero").style.display = left == 0 ? "block" : "none";

        document.querySelectorAll(".caseZero").forEach((e)=>{
          e.style.display = left == 0 ? "block" : "none";
        });
        document.querySelectorAll(".caseMore").forEach((e)=>{
          e.style.display = left > 0 ? "block" : "none";
        });
      }

      // komentarze start

      document.addEventListener("DOMContentLoaded", function() {
        createTable({
            name: "comments",
            lang: {
              subject: "komentarzy",
            },
            url: "/search_comments",
            params: () => {
                return {
                  product_id: <?=$product_data["product_id"]?>,
                };
            },
            renderRow: (r) => {
              var canDelete = r.user_id == <?=$app["user"]["id"] ? $app["user"]["id"] : 0?>;
              var canAccept = r.accepted == 0;
              var isAdmin = <?= $app["user"]["is_admin"] ? "true" : "false" ?>;
              if (!isAdmin) canAccept = false;
              if (isAdmin) canDelete = true;
              
              var buttons = "";
              if (canDelete) buttons += `<button class='btn red' style='margin-left:10px' onclick='commentAction(${r.comment_id},-1)'>Usuń</button>`;
              if (canAccept) buttons += `<button class='btn primary' style='margin-left:10px' onclick='commentAction(${r.comment_id},1)'>Akceptuj</button>`;

              return `<div class='comment_header'><div class='pseudonim'>${r.pseudonim} ${r.rating} ${buttons}</div><div class='dodano'>${r.dodano}</div></div><div class='text-wrap'>${r.tresc}</div>`;
            },
            definition: [{
                    title: "Pseudonim",
                    width: "10%",
                    render: (r) => {
                        return `${r.pseudonim}`;
                    }
                },
                {
                    title: "Komentarz",
                    width: "50%",
                    render: (r) => {
                        return `${r.tresc}`;
                    }
                },
                {
                    title: "Kiedy",
                    width: "10%",
                    render: (r) => {
                        return `${r.dodano}`;
                    }
                },
                {
                    title: "Ocena",
                    width: "10%",
                    render: (r) => {
                        return `${r.rating}`;
                    },
                    escape: false
                },
                {
                    title: "",
                    width: "10%",
                    render: (r) => {
                        var canDelete = r.user_id == <?=$app["user"]["id"] ? $app["user"]["id"] : 0?>;
                        var canAccept = r.accepted == 0;
                        var isAdmin = <?= $app["user"]["is_admin"] ? "true" : "false" ?>;
                        if (!isAdmin) canAccept = false;
                        if (isAdmin) canDelete = true;
                        
                        var buttons = "";
                        if (canDelete) buttons += `<button style='margin-left:10px' onclick='commentAction(${r.comment_id},-1)'>Usuń</button>`;
                        if (canAccept) buttons += `<button style='margin-left:10px' onclick='commentAction(${r.comment_id},1)'>Akceptuj</button>`;

                        return buttons;
                    },
                    escape: false,
                },
            ],
            controls: ``
        });
      });

      function commentAction(i, action) {
          if (action == -1 && !confirm("Czy aby na pewno chcesz usunąć komentarz?")) return;
          ajax("/commentAction", {
              comment_id: i,
              action: action
          }, () => {
              comments.search(()=>{
                document.getElementById("formComment").style.display = "block";
                document.getElementById("commentSent").style.display = "none";
              });
          }, () => {});
      }

      function newComment()
  		{
        var req = document.getElementsByClassName("required");
        for (i=0;i<req.length;i++)
        {
          var input = req[i];
          if (input.value == "")
          {
            input.style.borderColor = "red";
            input.oninput = function() {
              this.style.borderColor = "";
            }
            return;
          }
        }

        xhr({
          url: "/addComment",
          params: {
            product_id: <?=$product_data["product_id"]?>,
            pseudonim: document.getElementById("pseudonim").value,
            tresc: document.getElementById("tresc").value,
            rating: RATING
          },
          success: (res) => {
            comments.search(()=>{
              document.getElementById("formComment").style.display = "none";

              var out = "<h3>Dziękujemy za przekazaną opinię!</h3>";
              try {
                var json = JSON.parse(res);

                if (json.kod_rabatowy) {
                  out += `<div style='font-size: 24px;margin: 10px 0;display:block;'>Twój kod rabatowy: <span style='font-weight: bold;color: #37f;'>${json.kod_rabatowy}</span></div>`;
                  out += `<div>Kopię otrzymasz na skrzynkę pocztową</div>`;
                }
              } catch (e) {}

              document.getElementById("commentSent").innerHTML = out;
              document.getElementById("commentSent").style.display = "block";
            });
          }
        })
      }

      // komentarze end

      function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      }

      function sendNotification()
      {
        var e = document.getElementById("notification_email");
        var email = e.value;
        document.getElementById("user_email").innerHTML = email;
        if (!validateEmail(email)) {
          e.style.borderColor = "red";
          return;
        }
        ajax('/user_notify_variant',{
          variant_id: ids[VARIANT_ID],
          email: email
        },()=>{
          document.getElementById("whenNotificationAdded").style.display = "block";
          document.getElementById("hideWhenNotificationAdded").style.display = "none";
        },null);
      }
    </script>

    <?php if ($review_count > 0) : ?>
      <script <?='type="application/ld+json"'?>>
      {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "<?=htmlspecialchars($product_data["title"])?>",
        "url": "<?=$SITE_URL."/".$url?>",
        "image": [
          "<?=$product_data["image"]?>"
        ],
        "description": "<?=$product_data["seo_description"]?>",
        "brand": {
          "@type": "Thing",
          "name": "<?=config('main_email_sender')?>"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "<?=$avg_rating?>",
          "reviewCount": "<?=$review_count?>",
          "bestRating": 5,
          "worstRating": 0
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "PLN",
          "price": "<?=$regularPrice?>",
          "itemCondition": "https://schema.org/UsedCondition",
          "availability": "<?=$stockSchema?>",
          "seller": {
            "@type": "Organization",
            "name": "<?=config('main_email_sender')?>"
          }
        }
      }
      </script>
    <?php endif ?>
  </head>
  <body>

    <?php
      include "global/header.php";

      if ($product_data["published"] || $app["user"]["is_admin"])
      {
        include "produkt_view.php";
      }
      else
      {
        echo '<div class="centerVerticallyMenu" style="text-align:center">
          <h2>Produkt jest niedostępny!</h2>
          <p style="font-size:18px">Wróć na <a href="/" class="primary-link">stronę główną</a></p>
        </div>';
      }

      include "global/footer.php";
    ?>
  </body>
</html>
