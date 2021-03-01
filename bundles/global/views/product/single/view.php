<?php //route[produkt]

global $GENERAL_PRODUCT_ID;

$general_product_id = Request::urlParam(1);
if ($general_product_id) {
    $general_product_id = intval($general_product_id);
    $GENERAL_PRODUCT_ID = $general_product_id;
} else {
    Request::redirect("/");
}

$general_product_data = DB::fetchRow("SELECT * FROM general_product WHERE general_product_id = $general_product_id");
if (isset($preview_params) && isset($preview_params["products"])) {
    $general_product_data = array_merge($general_product_data, $preview_params);
}

if (!$general_product_data) {
    Request::redirect("/");
}

// $link = Request::urlParam(2);
// if ($link != $general_product_data["link"] && $general_product_data["link"]) {
//     Request::redirect(getProductLink($general_product_data["general_product_id"], $general_product_data["link"]));
// }

// $priceText = $general_product_data["price_min"];
// if (!empty($general_product_data["price_max"]) && $general_product_data["price_min"] != $general_product_data["price_max"])
//     $priceText .= " - " . $general_product_data["price_max"];

$general_product_products = DB::fetchArr("SELECT * FROM product WHERE general_product_id = $general_product_id AND active = 1");

$general_product_images = DB::fetchArr("SELECT * FROM product_image WHERE general_product_id = $general_product_id ORDER BY pos ASC"); // AND active = 1

foreach ($general_product_products as &$product) {
    $product_id = $product["product_id"];
    $product["variants"] = DB::fetchArr("SELECT pto.product_feature_option_id, pto.product_feature_id
        FROM product_to_feature_option ptfo INNER JOIN product p USING(product_id) INNER JOIN product_feature_option pto USING(product_feature_option_id)
        WHERE product_id = $product_id");

    //SELECT pto.product_feature_option_id, pto.product_feature_id feature_name FROM product_to_feature_option ptfo INNER JOIN product p USING(product_id) INNER JOIN product_feature_option pto USING(product_feature_option_id) WHERE product_id = 100
    //SELECT * FROM product_to_feature_option INNER JOIN product USING(product_id) INNER JOIN product_feature_option USING(product_feature_option_id) INNER JOIN product_feature USING(product_feature_id) WHERE general_product_id = 1
}
unset($product);

// if (isset($preview_params) && isset($preview_params["products"])) {
//     $products = json_decode($preview_params["products"], true);
// }

// $anyVariantInStock = false;
// foreach ($products as $variant) {
//     if ($variant["stock"] > 0) {
//         $anyVariantInStock = $variant["variant_id"];
//         break;
//     }
// }

// $page_data["seo_description"] = $general_product_data["seo_description"];
// $page_data["seo_title"] = $general_product_data["seo_title"];
// $page_data["seo_image"] = "/uploads/sm" . Files::getUploadedFileName($general_product_data["cache_thumbnail"]) . ".jpg";

$stockSchema = true ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

//addLastViewedProducts([$general_product_id]);

$general_product_data["cache_rating_count"] = 4;

$general_product_variants = DB::fetchArr("SELECT * FROM general_product_to_feature gptf
    INNER JOIN product_feature USING (product_feature_id)
    WHERE general_product_id = $general_product_id
    ORDER BY gptf.pos");

foreach ($general_product_variants as &$variant) {
    $product_feature_id = $variant["product_feature_id"];
    $variant["variant_options"] = DB::fetchArr("SELECT * FROM general_product_to_feature_option gptfo
        INNER JOIN product_feature_option USING (product_feature_option_id)
        WHERE general_product_id = $general_product_id AND product_feature_id = $product_feature_id
        ORDER BY gptfo.pos");
}
unset($variant);

?>

<?php startSection("head_content"); ?>

<script>
    const general_product_products = <?= json_encode($general_product_products) ?>;
    const general_product_images = <?= json_encode($general_product_images) ?>;
    for (const image of general_product_images) {
        image.option_ids = JSON.parse(image.options_json);
    }

    const GENERAL_PRODUCT_ID = <?= $general_product_data["general_product_id"] ?>;
</script>

<?php if ($general_product_data["cache_rating_count"] > 0) : ?>
    <script <?= 'type="application/ld+json"' ?>>
        {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "<?= htmlspecialchars($general_product_data["name"]) ?>",
            "url": "<?= SITE_URL . "/" . Request::$url ?>",
            "image": [
                "<?= $general_product_data["cache_thumbnail"] ?>"
            ],
            "description": "<?= $general_product_data["seo_description"] ?>",
            "brand": {
                "@type": "Thing",
                "name": "<?= $app["company_data"]['email_sender'] ?>"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "<?= $general_product_data["cache_avg_rating"] ?>",
                "reviewCount": "<?= $general_product_data["cache_rating_count"] ?>",
                "bestRating": 5,
                "worstRating": 0
            },
            "offers": {
                "@type": "Offer",
                "priceCurrency": "PLN",
                "price": "<?= $general_product_data["price_min"] ?>",
                "itemCondition": "https://schema.org/UsedCondition",
                "availability": "<?= $stockSchema ?>",
                "seller": {
                    "@type": "Organization",
                    "name": "<?= $app["company_data"]['email_sender'] ?>"
                }
            }
        }
    </script>
<?php endif ?>

<?php startSection("body_content"); ?>

<?php
if (true) : /* if ($general_product_data["published"] || User::getCurrent()->priveleges["backend_access"] || $preview_params) :*/
?>

    <div class="sticky_product">
        <span class="clamp_lines clamp_2"><?= $general_product_data["name"] ?></span>
        <img data-height="1w" class="product_image wo997_img">
    </div>

    <div class="product_wrapper" style="max-width: 1350px;margin: 10px auto;width: 100%;position: relative;align-items: flex-start;">
        <div class="product_images">
            <!-- sticky on desktop only -->
            <div class="wo997_slider" data-has_slider_below data-nav_out_from="1000px">
                <div class="wo997_slides_container">
                    <div class="wo997_slides_wrapper">
                        <?php
                        foreach ($general_product_images as $image) {
                        ?>
                            <div class="wo997_slide">
                                <img data-src="<?= $image["img_url"] ?>" data-height="1w" class="product_image wo997_img">
                            </div>
                        <?php
                        }
                        ?>
                    </div>
                </div>
            </div>
            <div data-slide_width="100px" data-show_next_mobile style="--slide_padding:5px" data-nav_out_from="1000px"></div>
        </div>
        <div class="product_offer">
            <div style="max-width: 450px; padding: 0 10px" class="mobileCenter">
                <h1 class="h1"><?= $general_product_data["name"] ?></h1>

                <div class="label">Sposób wyświetlania cen wariantów (dla admina)</div>
                <div class="vdo radio_group columns_1">
                    <div class="checkbox_area">
                        <p-checkbox data-value="1"></p-checkbox>
                        Subtelny napis
                    </div>
                    <div class="checkbox_area">
                        <p-checkbox data-value="2"></p-checkbox>
                        Czerwony prostokąt
                    </div>
                    <div class="checkbox_area">
                        <p-checkbox data-value="3"></p-checkbox>
                        Szary prostokąt
                    </div>
                    <div class="checkbox_area">
                        <p-checkbox data-value="4"></p-checkbox>
                        Brak
                    </div>
                </div>

                <div>
                    <?php
                    foreach ($general_product_variants as $general_product_variant) {
                    ?>
                        <span class="label"><?= $general_product_variant["name"] ?></span>
                        <div class="variants radio_group boxes hide_checks columns_<?= def($general_product_variant, "columns", "2") ?>" style='margin-bottom:20px;--box_height:<?= def($general_product_variant, "height", "80px") ?>' data-product_feature_id="<?= $general_product_variant["product_feature_id"] ?>" data-number>
                            <?php
                            foreach ($general_product_variant["variant_options"] as $variant_option) {
                            ?>
                                <div class="box checkbox_area variant_option">
                                    <div>
                                        <div class="price_diff_before"></div>
                                        <div>
                                            <p-checkbox data-value="<?= $variant_option["product_feature_option_id"] ?>"></p-checkbox>
                                            <?php
                                            $color = def($variant_option, ["extra", "color"], "");
                                            if ($color) {
                                            ?>
                                                <div class="color_circle" style="background-color:<?= $color ?>"></div>
                                            <?php
                                            }
                                            ?>
                                            <?= $variant_option["name"] ?>
                                        </div>
                                        <div class="price_diff"></div>
                                    </div>
                                </div>
                            <?php
                            }
                            ?>
                        </div>
                    <?php
                    }

                    ?>

                    <p style='margin: 0; font-size: 1.6em;' class="semi-bold">
                        <span>Cena: </span><span class="pln selected_product_price"></span> <span class="selected_product_was_price slash"></span>
                    </p>

                    <p style='font-weight:normal;margin:0;font-size: 1.1em;' id="quantity"></p>

                    <p style='font-weight:normal;margin:0;font-size: 1.1em;'>Czas realizacji: 24h</p>

                    <div style="height:20px"></div>
                    <button class="btn medium fill buy_btn" onclick="addVariantToBasket(VARIANT_ID,1,{show_modal:true,modal_source:this})">
                        Dodaj do koszyka
                        <i class="fas fa-shopping-bag"></i>
                    </button>

                    <div class="expand_y hidden animate_hidden case_basket_not_empty wtwoimkoszyku" data-general_product_id="<?= $general_product_id ?>"></div>
                    <div class="product_basket_products" data-general_product_id="<?= $general_product_id ?>"></div>
                    <div class="expand_y hidden animate_hidden case_basket_not_empty" data-general_product_id="<?= $general_product_id ?>">
                        <a class="btn primary medium fill" href="/zakup" style="margin-top: 20px">
                            Przejdź do koszyka
                            <i class="fa fa-chevron-right"></i>
                        </a>
                    </div>

                    <div class="expand_y hidden animate_hidden notify_product_available">
                        <h3 style="margin:12px 0 0">Powiadom o dostępności</h3>
                        <label style="font-size:16px;margin: 10px 0;display: flex;align-items: center;">
                            <span>Twój e-mail: </span>
                            <input type="text" value="<?= User::getCurrent()->data["email"] ?>" id="notification_email" style="width: auto;flex-grow: 1;margin-left: 10px;padding: 1px 4px;">
                        </label>
                        <button id="notify" class="btn primary medium fill" onclick="sendNotification()">
                            Potwierdź powiadomienie
                            <i class="fa fa-envelope" style="font-size: 14px;"></i>
                        </button>
                        <p id="whenNotificationAdded" style="display:none;color: white; background: #1b1; border-radius: 3px; padding: 3px 10px;text-align:center;max-width:450px;">Wyślemy powiadomienie na <span id="user_email"></span> kiedy produkt pojawi się w sklepie <i class="fa fa-envelope"></i></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div style="width: 100%;max-width: 1500px;margin: 50px auto; padding:10px;">
        <div class="cms" style="margin:50px -10px;width: auto;"><?= "" //getCMSPageHTML($general_product_data["description"]); 
                                                                ?></div>

        <h3 style="margin:30px 0 30px;font-size:22px"><i class="fas fa-comments"></i> Komentarze</h3>

        <div class="comments table-without-headers">
            <?php
            // $comments = DB::fetchArr("SELECT dodano, pseudonim, tresc, user_id, comment_id, rating, accepted FROM comments WHERE general_product_id = " . $general_product_data["general_product_id"] . " AND accepted = 1");

            // foreach ($comments as $comment) {
            //     echo '<div style="display:none">' . $comment["pseudonim"] . ' - ' . $comment["tresc"] . '</div>';
            // }
            ?>
        </div>

        <?php if (User::getCurrent()->isLoggedIn()) : ?>
            <?php
            $pseudonim = def("SELECT pseudonim FROM users WHERE user_id = " . intval(User::getCurrent()->isLoggedIn()), "");
            ?>
            <div id="formComment" data-form>
                <h4 style="font-size: 22px; margin: 70px 0 10px;">Podziel się swoją opinią</h4>
                <?php
                $can_user_get_comment_rebate = canUserGetCommentRebate($general_product_id);

                if ($can_user_get_comment_rebate) {
                    echo '<h4 class="rebate-info">W nagrodę otrzymasz kod rabatowy o wartości 25 zł <i class="fas fa-comments-dollar" style="font-size: 26px;margin: -8px 0;"></i></h4>';
                }
                ?>
                <div style="height:10px"></div>
                <div class="label">
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
                    <div class="label">Pseudonim</div>
                    <input type="text" class="field pseudonim" value="<?= $pseudonim ?>">
                </label>

                <label>
                    <div class="label">Komentarz</div>
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

<?php if (User::getCurrent()->priveleges["backend_access"] && !isset($preview_params)) : ?>
    <div class="right_side_menu freeze_before_load">
        <button class="toggle-sidemenu-btn btn primary" onclick="toggleRightSideMenu()">
            <i class="fas fa-chevron-right"></i>
            <i class="fas fa-cog"></i>
        </button>
        <div class="label first" style="font-size:1.2em;margin-top: 2px;text-align:center">Edycja</div>

        <?php if ($general_product_data["published"] === 1) {
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
            <a href="<?= Request::$static_urls["ADMIN"] ?>produkt/<?= $general_product_id ?>" class="btn primary fill">Więcej <i class="fas fa-cog"></i></a>
        </div>
    </div>

    <script>
        // function toggleProductPublish() {
        //     xhr({
        //         url: STATIC_URLS["ADMIN"] + "set_publish",
        //         params: {
        //             table: "products",
        //             primary: "general_product_id",
        //             primary_id: <?= $general_product_id ?>,
        //             published: <?= 1 // - $general_product_data["published"] 
                                    ?>,
        //         },
        //         success: () => {
        //             window.location.reload();
        //         },
        //     });
        // }

        <?php if (false) : //$general_product_data["published"] == 0) : 
        ?>
            domload(() => {
                toggleRightSideMenu();
            })
        <?php endif ?>
    </script>
<?php endif ?>

<?php include "bundles/global/templates/default.php"; ?>