<?php //route[produkt]

global $PRODUCT_ID;

$product_id = urlParam(1);
if ($product_id) {
    $product_id = intval($product_id);
    $PRODUCT_ID = $product_id;
} else {
    redirect("/");
}

$product_data = DB::fetchRow("SELECT * FROM products WHERE product_id = $product_id");
if (isset($preview_params) && isset($preview_params["variants"])) {
    $product_data = array_merge($product_data, $preview_params);
}

if (!$product_data) {
    redirect("/");
}

$link = urlParam(2);
if ($link != $product_data["link"] && $product_data["link"]) {
    redirect(getProductLink($product_data["product_id"], $product_data["link"]));
}

$priceText = $product_data["price_min"];
if (!empty($product_data["price_max"]) && $product_data["price_min"] != $product_data["price_max"])
    $priceText .= " - " . $product_data["price_max"];

$variants = DB::fetchArr("SELECT * FROM variant WHERE product_id = $product_id AND published = 1 ORDER BY kolejnosc");

if (isset($preview_params) && isset($preview_params["variants"])) {
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
foreach ($gallery as $pic) {
    $galleryhtml .= "<div class='wo997_slide'><img data-src='" . $pic["src"] . "' data-height='1w' class='product-image wo997_img'></div>";
}
$galleryhtml .= $galleryhtml . $galleryhtml;

$page_data["seo_description"] = $product_data["seo_description"];
$page_data["seo_title"] = $product_data["seo_title"];
$page_data["seo_image"] = "/uploads/sm" . getUploadedFileName($product_data["cache_thumbnail"]) . ".jpg";

$stockSchema = $anyVariantInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

addLastViewedProducts([$product_id]);






$variants = [
    /*[
        "filter_name" => "Model",
        "columns" => "3",
        "height" => "80px",
        "filter_options" => [
            ["value" => "Z20"],
            ["value" => "Z20+"],
            ["value" => "Z20 Undra"],
        ]
    ],*/
    [
        "variant_id" => "3",
        "filter_name" => "Kolor",
        "columns" => "2",
        "height" => "80px",
        "variant_options" => [
            ["option_id" => 123, "value" => "Czerwony", "extra" => ["color" => "#c22"]],
            ["option_id" => 124, "value" => "Zielony", "extra" => ["color" => "#2c2"]],
            ["option_id" => 125, "value" => "Żólty", "extra" => ["color" => "#ff2"]],
        ]
    ],
];

$values = [];
$id = 1000;
for ($i = 20; $i < 30; $i += 0.5) {
    $id++;
    $values[] = ["option_id" => $id, "value" => $i];
}
$variants[] =
    [
        "variant_id" => "4",
        "filter_name" => "Rozmiar",
        "columns" => "4",
        "height" => "50px",
        "variant_options" => $values
    ];
// json_decode($product_data["variant_filters"], true);

$page_products = [];

// will come straight from DB !!!!
$product_id = 0;
foreach ($variants[1]["variant_options"] as $size_option) {
    foreach ($variants[0]["variant_options"] as $color_option) {
        $product_id++;

        $was_price = 20 + $product_id + ($color_option["option_id"] == "124" ? 1 : 0);
        $price = $was_price;
        if (rand(0, 5) < 2) {
            $price -= rand(10, 0);
        }

        $page_products[] = [
            "product_id" => $product_id,
            "price" => $price,
            "was_price" => $was_price,
            "stock" => rand(0, 5),
            "published" => rand(0, 5) >= 1,
            "variants" => [
                $variants[0]["variant_id"] => $color_option["option_id"],
                $variants[1]["variant_id"] => $size_option["option_id"],
            ]
        ];
    }
}
?>

<?php startSection("head_content"); ?>

<script>
    const page_products = <?= json_encode($page_products) ?>;

    var variants = <?= json_encode($variants) ?>;
    const PRODUCT_ID = <?= $product_data["product_id"] ?>;

    var attribute_values_array = <?= json_encode(DB::fetchArr('SELECT value, value_id, attribute_id, parent_value_id FROM attribute_values'), true) ?>;
    var attribute_values = {};
    attribute_values_array.forEach(value => {
        attribute_values[value["value_id"]] = {
            value: value["value"],
            attribute_id: +value["attribute_id"],
            parent_value_id: +value["parent_value_id"],
        };
    });

    Object.entries(attribute_values).forEach(([value_id, value]) => {
        var whole_value = value.value;
        var curr_level_value = value;
        while (true) {
            var parent_value_id = +curr_level_value.parent_value_id;
            if (parent_value_id <= 0) {
                break;
            }
            parent_value = attribute_values[parent_value_id];
            if (!parent_value) {
                break;
            }
            whole_value = parent_value.value + " ❯ " + whole_value;

            curr_level_value = parent_value;
        }
        value.whole_value = whole_value;
    });

    var attributes_array = <?= json_encode(DB::fetchArr('SELECT name, attribute_id FROM product_attributes'), true) ?>;
    var attributes = {};
    attributes_array.forEach(attribute => {
        attributes[attribute["attribute_id"]] = attribute["name"];
    });
</script>

<?php if ($product_data["cache_rating_count"] > 0) : ?>
    <script <?= 'type="application/ld+json"' ?>>
        {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "<?= htmlspecialchars($product_data["title"]) ?>",
            "url": "<?= SITE_URL . "/" . URL ?>",
            "image": [
                "<?= $product_data["cache_thumbnail"] ?>"
            ],
            "description": "<?= $product_data["seo_description"] ?>",
            "brand": {
                "@type": "Thing",
                "name": "<?= $app["company_data"]['email_sender'] ?>"
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
                    "name": "<?= $app["company_data"]['email_sender'] ?>"
                }
            }
        }
    </script>
<?php endif ?>

<?php startSection("body_content"); ?>

<?php
if ($product_data["published"] || $app["user"]["priveleges"]["backend_access"] || $preview_params) :
?>

    <div class="mobileRow productWrapper" style="max-width: 1350px;margin: 10px auto;width: 100%;position: relative;align-items: flex-start;">
        <div style="width: 47%;margin: 32px auto 0;/*position: sticky;top: 150px;*/">
            <!-- sticky on desktop only -->
            <?php if (count($gallery) == 1) : ?>
                <img data-src='<?= $product_data["cache_thumbnail"] ?>' data-height='1w' class='product-image wo997_img'>
            <?php else : ?>
                <div class="wo997_slider" data-has_slider_below data-nav_out_from="1000px">
                    <div class="wo997_slides_container">
                        <div class="wo997_slides_wrapper">
                            <?= $galleryhtml ?>
                        </div>
                    </div>
                </div>
                <div data-slide_width="100px" data-show_next_mobile style="--slide_padding:5px" data-nav_out_from="1000px"></div>
            <?php endif ?>
        </div>
        <div style="width: 40%; margin-top: 20px">
            <div style="max-width: 450px; padding: 0 10px" class="mobileCenter">
                <h1 class="h1"><?= $product_data["title"] ?></h1>

                <div class="label">Sposób wyświetlania cen wariantów (dla admina)</div>
                <radio-input class="vdo default columns_1" style="--option-padding:3px;margin-bottom:20px;" onchange="toggleVariantStyle(this)">
                    <radio-option value="1" class="default">Subtelny napis</radio-option>
                    <radio-option value="2">Czerwony prostokąt</radio-option>
                    <radio-option value="3">Szary prostokąt</radio-option>
                    <radio-option value="4">Brak</radio-option>
                </radio-input>

                <div>
                    <?php
                    foreach ($variants as $variant) {
                    ?>
                        <span class="label"><?= $variant["filter_name"] ?></span>
                        <radio-input class="variant_radio blocks unselectable columns_<?= def($variant, "columns", "2") ?>" style='margin-bottom:20px;--radio_input_block_height:<?= def($variant, "height", "80px") ?>' data-variant_id="<?= $variant["variant_id"] ?>" data-number>
                            <?php
                            foreach ($variant["variant_options"] as $option) {
                            ?>
                                <radio-option class="variant_option" value="<?= $option["option_id"] ?>">
                                    <div>
                                        <div class="price_diff_before"></div>
                                        <div>
                                            <?php
                                            $color = def($option, ["extra", "color"], "");
                                            if ($color) {
                                            ?>
                                                <div class="color_circle" style="background-color:<?= $color ?>"></div>
                                            <?php
                                            }
                                            ?>
                                            <?= $option["value"] ?>
                                        </div>
                                        <div class="price_diff"></div>
                                    </div>
                                </radio-option>
                            <?php
                            }
                            ?>
                        </radio-input>
                    <?php
                    }

                    ?>

                    <p style='font-weight:normal;margin: 0; font-size: 1.6em;'>
                        <span>Cena: </span><span class="pln selected_product_price"></span> <span class="selected_product_was_price slash"></span>
                    </p>

                    <p style='font-weight:normal;margin:0;font-size: 1.1em;' id="quantity"></p>

                    <p style='font-weight:normal;margin:0;font-size: 1.1em;'>Czas realizacji: 24h</p>

                    <div style="height:20px"></div>
                    <button class="btn medium fill buy_btn" onclick="addVariantToBasket(VARIANT_ID,1,{show_modal:true,modal_source:this})">
                        Dodaj do koszyka
                        <img class="basket-icon" src="/src/img/basket_icon.svg">
                    </button>

                    <div class="expand_y hidden animate_hidden case_basket_not_empty wtwoimkoszyku" data-product_id="<?= $product_id ?>"></div>
                    <div class="product_basket_variants" data-product_id="<?= $product_id ?>"></div>
                    <div class="expand_y hidden animate_hidden case_basket_not_empty" data-product_id="<?= $product_id ?>">
                        <a class="btn primary medium fill" href="/zakup" style="margin-top: 20px">
                            Przejdź do koszyka
                            <i class="fa fa-chevron-right"></i>
                        </a>
                    </div>

                    <div class="expand_y hidden animate_hidden notify_product_available">
                        <h3 style="margin:12px 0 0">Powiadom o dostępności</h3>
                        <label style="font-size:16px;margin: 10px 0;display: flex;align-items: center;">
                            <span>Twój e-mail: </span>
                            <input type="text" value="<?= $app["user"]["email"] ?>" id="notification_email" style="width: auto;flex-grow: 1;margin-left: 10px;padding: 1px 4px;">
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
        <div class="cms" style="margin:50px -10px;width: auto;"><?= getCMSPageHTML($product_data["description"]); ?></div>

        <h3 style="margin:30px 0 30px;font-size:22px"><i class="fas fa-comments"></i> Komentarze</h3>

        <div class="comments table-without-headers">
            <?php
            $comments = DB::fetchArr("SELECT dodano, pseudonim, tresc, user_id, comment_id, rating, accepted FROM comments WHERE product_id = " . $product_data["product_id"] . " AND accepted = 1");

            foreach ($comments as $comment) {
                echo '<div style="display:none">' . $comment["pseudonim"] . ' - ' . $comment["tresc"] . '</div>';
            }
            ?>
        </div>

        <?php if ($app["user"]["id"]) : ?>
            <?php
            $pseudonim = def("SELECT pseudonim FROM users WHERE user_id = " . intval($app["user"]["id"]), "");
            ?>
            <div id="formComment" data-form>
                <h4 style="font-size: 22px; margin: 70px 0 10px;">Podziel się swoją opinią</h4>
                <?php
                $can_user_get_comment_rebate = canUserGetCommentRebate($product_id);

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

<?php if ($app["user"]["priveleges"]["backend_access"] && !isset($preview_params)) : ?>
    <div class="right_side_menu freeze_before_load">
        <button class="toggle-sidemenu-btn btn primary" onclick="toggleRightSideMenu()">
            <i class="fas fa-chevron-right"></i>
            <i class="fas fa-cog"></i>
        </button>
        <div class="label first" style="font-size:1.2em;margin-top: 2px;text-align:center">Edycja</div>

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
            <a href="<?= STATIC_URLS["ADMIN"] ?>produkt/<?= $product_id ?>" class="btn primary fill">Więcej <i class="fas fa-cog"></i></a>
        </div>
    </div>

    <script>
        function toggleProductPublish() {
            xhr({
                url: STATIC_URLS["ADMIN"] + "set_publish",
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

<?php include "user/page_template.php"; ?>