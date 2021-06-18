<?php //route[/produkt]

global $GENERAL_PRODUCT_ID;

$general_product_id = Request::urlParam(1);

if ($general_product_id) {
    $general_product_id = intval($general_product_id);
    $GENERAL_PRODUCT_ID = $general_product_id;
    $general_product_data = DB::fetchRow("SELECT * FROM general_product WHERE general_product_id = $general_product_id");
} else {
    Request::notFound();
}

if (!$general_product_data) {
    Request::notFound();
}

$page_data = DB::fetchRow("SELECT seo_title, seo_description, page_id FROM page WHERE link_what_id = $general_product_id AND page_type='general_product'");

if (!$page_data) {
    Request::notFound();
}

$option_ids_str = def($_GET, "v");
$option_names = [];
if ($option_ids_str) {
    $option_ids = explode("-", $option_ids_str);
    $option_names = getVariantNamesFromOptionIds($option_ids);
} else {
    $option_ids = [];
}

$full_product_name = $general_product_data["name"];
foreach ($option_names as $option_name) {
    $full_product_name .= " | " . $option_name;
}

$product_link = getProductLink($general_product_id, $general_product_data["name"], $option_ids, $option_names);

if (!$general_product_data) {
    Request::notFound();
}

$product_link_base = explode("?", $product_link)[0];
if ($product_link_base !== Request::$url) {
    $true_product_link = $product_link_base;
    if ($_GET) {
        $true_product_link .= "?" . http_build_query($_GET);
    }
    Request::redirectPermanent($true_product_link);
}

$general_product_products = DB::fetchArr("SELECT active, general_product_id, gross_price, net_price, product_id, stock,__img_url, __name, __options_json, __queue_count, __url, '' variants, length, width, height, weight FROM product WHERE general_product_id = $general_product_id AND active = 1");

$general_product_imgs_json = $general_product_data["__images_json"];
$general_product_imgs = json_decode($general_product_imgs_json, true);

foreach ($general_product_products as &$product) {
    $product_id = $product["product_id"];
    $product["variants"] = DB::fetchCol("SELECT pto.product_variant_option_id
        FROM product_to_variant_option ptfo INNER JOIN product p USING(product_id) INNER JOIN product_variant_option pto USING(product_variant_option_id)
        WHERE product_id = $product_id");
}
unset($product);

User::getCurrent()->last_viewed_products->add([$general_product_id]);

$general_product_data["cache_rating_count"] = 4;

$general_product_variants = DB::fetchArr("SELECT * FROM product_variant pv WHERE general_product_id = $general_product_id AND pos <> 0 AND common = 0 ORDER BY pv.pos ASC");

foreach ($general_product_variants as $key => $variant) {
    $product_variant_id = $general_product_variants[$key]["product_variant_id"];
    $general_product_variants[$key]["options"] = DB::fetchArr("SELECT *
        FROM product_variant_option pvo
        WHERE product_variant_id = $product_variant_id AND pos <> 0
        ORDER BY pvo.pos");
}

// comments
$comments_options = DB::fetchArr("SELECT pvo.product_variant_option_id, pvo.name, COUNT(1) count
    FROM comment c
    INNER JOIN comment_to_product_variant_option ctpvo USING (comment_id)
    INNER JOIN product_variant_option pvo USING (product_variant_option_id)
    WHERE c.general_product_id = $general_product_id
    GROUP BY pvo.product_variant_option_id
    ORDER BY COUNT(1) DESC");
$comments_options_map = getAssociativeArray($comments_options, "product_variant_option_id");

$comments_data = getProductCommentsSearch($general_product_id, json_encode(["page_id" => 0, "row_count" => 10]));

$variants_less_html = "";
foreach ($general_product_variants as $general_product_variant) {
    $name = $general_product_variant["name"];
    $variants_less_html .= "
        <span class=\"label\">$name</span>
        <div class=\"radio_group unselectable\">
        <div class=\"checkbox_area\">
            <p-checkbox data-value=\"0\"></p-checkbox>
            <span>Wszystkie</span>
        </div>
    ";
    foreach ($general_product_variant["options"] as $variant_option) {
        $product_variant_option_id = $variant_option["product_variant_option_id"];
        $name = $variant_option["name"];
        $count = isset($comments_options_map[$product_variant_option_id]) ? $comments_options_map[$product_variant_option_id]["count"] : "0";
        $variants_less_html .= "
            <br>
            <div class=\"checkbox_area\" style=\"margin-top: 7px;\">
                <p-checkbox data-value=\"$product_variant_option_id\"></p-checkbox>
                <span>$name</span> <span class=\"count\">($count)</span>
            </div>
        ";
    }
    $variants_less_html .= "</div>";
}

// delivery info
$product_shipping_info = [];
foreach ($general_product_products as &$product) {
    $product_id = $product["product_id"];

    $products_dims = [[$product["length"], $product["width"], $product["height"]]];

    $shipping_info = [];

    foreach (DB::fetchArr("SELECT carrier_id, __full_name, dimensions_json FROM carrier WHERE active ORDER BY delivery_type_id") as $carrier) {
        $dimensions = json_decode($carrier["dimensions_json"], true);

        $dimension_fits = null;

        foreach ($dimensions as $dimension) {
            $fits = true;

            $max_weight_kg = $dimension["weight"];
            if ($max_weight_kg && $product["weight"] > $max_weight_kg * 1000) {
                $fits = false;
            } else if ($dimension["length"] && $dimension["width"] && $dimension["height"]) {
                $fits = putBoxIntoPackage3D([
                    $dimension["length"],
                    $dimension["width"],
                    $dimension["height"],
                ], $products_dims);
            }

            if ($fits) {
                $dimension_fits = $dimension;
                break;
            }
        }

        if (!$dimension_fits) {
            continue;
        }

        $shipping_info[] = ["carrier_id" => $carrier["carrier_id"], "name" => $carrier["__full_name"], "price" => $dimension_fits["price"]];
    }

    $product_shipping_info[$product["product_id"]] = $shipping_info;
}


// user data
$user_data = DB::fetchRow("SELECT nickname, email FROM user WHERE user_id = ?", [User::getCurrent()->getId()]);
$user_nickname = $user_data ? $user_data["nickname"] : "";
if (!$user_nickname || trim($user_nickname) === "") {
    $user_nickname = "Gość";
}
$user_email = $user_data ? $user_data["email"] : "";

?>

<?php Templates::startSection("page_type_specific_head"); ?>

<title><?= $full_product_name ?> - <?= getShopName() ?></title>

<link rel="canonical" href="<?= SITE_URL . getProductLink($general_product_id, $general_product_data["name"]) ?>" />

<script>
    const general_product_id = <?= $general_product_data["general_product_id"] ?>;
    const general_product_name = "<?= htmlspecialchars($general_product_data["name"]) ?>";
    const general_product_products = <?= json_encode($general_product_products) ?>;
    const general_product_imgs = <?= $general_product_imgs_json ?>;
    const general_product_variants = <?= json_encode($general_product_variants) ?>;
    const general_product_comments_rows = <?= json_encode($comments_data["rows"]) ?>;
    const product_shipping_info = <?= json_encode($product_shipping_info) ?>;

    <?php if (isset($_GET["komentarz"])) { ?>
        // not yet dude :)
        // domload(() => {
        //     showModal(`addComment`);
        // })
    <?php } ?>
</script>

<?php Templates::startSection("view_product_images_variants_buy"); ?>

<div class="sticky_product">
    <span class="clamp_lines clamp_2 full_product_name"><?= $full_product_name ?></span>
    <div class="img_wrapper">
        <img class="product_img wo997_img">
    </div>
</div>

<?php
$main_img = def($general_product_imgs, 0);
if ($main_img) {
    $image_data = Files::getResponsiveImageData($main_img["img_url"]);
    $preload_src = "/" . UPLOADS_PATH . "md" . "/" . $image_data["file_name"] . (WEBP_SUPPORT ? ".webp" : ".jpg");
?>
    <img src="<?= $preload_src ?>" class="hidden">
<?php
}
?>


<div class="product_wrapper">
    <div class="product_imgs">
        <div class="wo997_slider" data-has_slider_below data-nav_out_from="1000px">
            <div class="wo997_slides_container">
                <div class="wo997_slides_wrapper">
                    <?php
                    foreach ($general_product_imgs as $image) {
                    ?>
                        <div class="wo997_slide">
                            <div class="square_img_wrapper">
                                <img data-src="<?= $image["img_url"] ?>" class="product_img wo997_img">
                            </div>
                        </div>
                    <?php
                    }
                    ?>
                </div>
            </div>
        </div>
        <div data-slide_width="100px" data-show_next_mobile data-nav_out_from="1000px"></div>
    </div>
    <div class="product_offer">
        <h1 class="h1"><?= $general_product_data["name"] ?></h1>

        <!-- <div style="display:none">
            <div class="label">Sposób wyświetlania cen wariantów (dla admina)</div>
            <div class="vdo radio_group --columns:1">
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
        </div> -->

        <div class="variants_container">
            <?php
            foreach ($general_product_variants as $general_product_variant) {
            ?>
                <span class="label"><?= $general_product_variant["name"] ?></span>
                <div class="variants radio_group boxes number unselectable hide_checks" style='margin-bottom:20px;--box_height:<?= def($general_product_variant, "height", "60px") ?>;--columns:<?= def($general_product_variant, "columns", "2") ?>'>
                    <?php
                    foreach ($general_product_variant["options"] as $variant_option) {
                    ?>
                        <div class="checkbox_area variant_option">
                            <div>
                                <div class="price_diff_before"></div>
                                <div>
                                    <p-checkbox data-value="<?= $variant_option["product_variant_option_id"] ?>"></p-checkbox>
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
            <?php } ?>
        </div>

        <p style="font-size: 1.1em;">Dostępność: <span class="selected_product_qty"></span></p>

        <div class="expand_y hidden animate_hidden case_notify_available">
            <div style="padding-top:7px">
                <button class="btn primary medium fill" onclick="showModal(`notifyProductAvailable`,{source:this});">Powiadom o dostępności <i class="fas fa-bell"></i></button>
                <div class="semi_bold selected_product_queue_pretty mr1 mt1"></div>
            </div>
        </div>

        <div class="mt2">
            <div class="mb1"> <i class="fas fa-shipping-fast"></i> Wysyłka w 24h (w dni robocze)</div>
            <ul class="product_shipping_info blc"></ul>
        </div>

        <div class="mt2">
            <div class="link ask_product_btn"> <i class="fas fa-envelope"></i> Zadaj pytanie sprzedawcy </div>
        </div>

        <p class="price_label">
            <span>Cena: </span><span class="pln selected_product_price"></span> <span class="selected_product_was_price slash"></span>
        </p>

        <div class="case_can_buy_product" data-tooltip_position="center">
            <div class="label">Ilość:</div>
            <div class="flex align_center">
                <div class="glue_children qty_controls main_qty_controls mr2" data-product="single_product">
                    <button class="btn subtle sub_qty">
                        <i class="fas fa-minus"></i>
                    </button>
                    <div class="spinner_wrapper inline">
                        <input class="field inline val_qty number" value="1" inputmode="numeric">
                    </div>
                    <button class="btn subtle add_qty">
                        <i class="fas fa-plus"></i>
                    </button>

                </div>
                <div class="qty_price_quick"></div>
            </div>
            <br>
            <button class="btn fill medium buy_btn main_buy_btn">
                Dodaj do koszyka
                <div style="display:inline-block;" class="spinner_wrapper inline">
                    <i class="fas fa-plus"></i>
                    <div class="spinner overlay white"></div>
                </div>
            </button>
        </div>

        <div class="case_has_products expand_y hidden animate_hidden">
            <div>
                <div class="label inyourbasket">W Twoim koszyku:</div>
                <cart-products-comp class="has_products"></cart-products-comp>
                <a class="btn fill medium primary" href="/kup-teraz">
                    Kup teraz
                    <i class="fas fa-chevron-right"></i>
                </a>
            </div>
        </div>
    </div>
</div>

<div id="notifyProductAvailable" data-modal data-dismissable>
    <div class="modal_body" style="width: 480px;">
        <button class="close_modal_btn"><i class="fas fa-times"></i></button>

        <h3 class="modal_header">Powiadom o dostępności</h3>

        <div class="scroll_panel scroll_shadow panel_padding">
            <form>
                <hr>
                <div style="position:relative">
                    <img src="/src/img/hourglass.svg" style="opacity: 0.04;font-size: 6em;position: absolute;right: 10px;bottom: 52px;transform: rotate(7deg);width: 68px;">
                    <div style="position:relative;text-align:center">
                        <div class="pt2 pb2">
                            Otrzymasz powiadomienie gdy produkt pojawi się w sklepie:
                            <div class="full_product_name semi_bold"><?= $full_product_name ?></div>
                        </div>

                        <div class="label mt2">Podaj swój adres e-mail</div>
                        <input class="field email" data-validate="email" value="<?= htmlspecialchars($user_email) ?>" style="text-align: center;">
                    </div>
                </div>

                <div class="flex mt2">
                    <button class="btn subtle fill mr2" onclick="hideAllModals()">Anuluj</button>
                    <button class="btn primary fill">Potwierdź</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div id="notifyProductSuccess" data-modal data-dismissable>
    <div class="modal_body" style="width: 392px;">
        <button class="close_modal_btn"><i class="fas fa-times"></i></button>

        <h3 class="modal_header">Jesteś w kolejce!</h3>

        <div class="scroll_panel scroll_shadow panel_padding">
            <div>
                <hr>
                <div style="position:relative;text-align:center;padding: 10px 0">
                    <img src="/src/img/check_circle.svg" style="opacity: 0.04;font-size: 6em;position: absolute;right: 5px;bottom: 30px;width: 100px;">
                    <div style="position:relative;margin-bottom:10px;">
                        Oczekuj na powiadomienie pod adresem <span class="email"></span>.
                        <div style="margin-top:7px">
                            Zadbamy o to by
                            <span class="full_product_name"><?= $full_product_name ?></span>
                            pojawił się w naszym sklepie jak najszybciej!
                        </div>
                    </div>
                </div>

                <button class="btn primary close_btn fill" onclick="hideAllModals()">OK </button>
            </div>
        </div>
    </div>
</div>

<div id="AskProduct" data-modal data-dismissable>
    <div class="modal_body" style="width: 480px;">
        <button class="close_modal_btn"><i class="fas fa-times"></i></button>

        <h3 class="modal_header">Zapytanie o produkt</h3>

        <div class="scroll_panel scroll_shadow panel_padding">
            <form id="contactForm">
                <hr>
                <div class="label">Imię i nazwisko</div>
                <input class="field pretty_errors" autocomplete="name" data-name="name" data-validate="">

                <div class="label">Adres e-mail</div>
                <input class="field pretty_errors" autocomplete="email" data-name="email" data-validate="string|email">

                <div class="label">Tytuł</div>
                <input class="field pretty_errors" data-name="subject" data-validate="">

                <div class="label">Wiadomość</div>
                <textarea class="field" style="height:100px" data-name="message" data-validate=""></textarea>

                <button class="btn primary fill mt2" type="submit">Wyślij <i class="fas fa-paper-plane"></i></button>
            </form>
        </div>
    </div>
</div>

<?php Templates::startSection("view_product_feature_list"); ?>

<div class="product_feature_list">
    <?php
    $product_features = DB::fetchArr("SELECT name, product_feature_id
        FROM general_product_to_feature gptf
        INNER JOIN product_feature USING (product_feature_id)
        WHERE general_product_id = $general_product_id
        ORDER BY gptf.pos ASC");

    foreach ($product_features as $product_feature) {
        $product_feature_id = $product_feature["product_feature_id"];
    ?>
        <div class="pflr">
            <div class="pflc semi_bold">
                <?= $product_feature["name"] ?>
            </div>
            <div class="pflc">
                <?php
                $product_feature_options = DB::fetchArr("SELECT value, product_feature_option_id
                    FROM general_product_to_feature_option gptfo
                    INNER JOIN product_feature_option USING (product_feature_option_id)
                    WHERE general_product_id = $general_product_id AND product_feature_id = $product_feature_id
                    ORDER BY gptfo.pos ASC");

                $first = true;
                foreach ($product_feature_options as $product_feature_option) {
                    if ($first) {
                        $first = false;
                    } else {
                        echo "|";
                    }
                ?>
                    <span class="pflo" data-option_id="<?= $product_feature_option["product_feature_option_id"] ?>">
                        <?= $product_feature_option["value"] ?>
                        <i class="fas fa-check case_active text_success"></i>
                    </span>
                <?php } ?>
            </div>
        </div>
    <?php } ?>
</div>

<?php Templates::startSection("view_product_comments"); ?>

<div class="product_comments">
    <div class="mb1">
        <span class="label medium bold inline comments_label mr1">Komentarze (<span class="results_info_count"><?= $comments_data["total_rows"] ?></span>)</span>
        <?php if (User::getCurrent()->isLoggedIn()) : ?>
            <button class="btn primary mr1 add_comment_btn_top" onclick="showModal(`addComment`,{source:this});">
                Napisz komentarz <i class="fas fa-comment" style="margin-left:4px"></i>
            </button>
        <?php endif ?>
        <button class="btn subtle show_filters"> Filtruj <i class="fas fa-search"></i></button>
    </div>

    <div class="comments_filters expand_y hidden animate_hidden">
        <div class="coms_container">
            <div class="label first">Wyszukaj w komentarzu:</div>
            <input class="field inline phrase">

            <div class="variants_container">
                <?= $variants_less_html ?>
            </div>

            <div class="mtf"></div>
            <button class="btn primary search_btn">
                Pokaż wyniki
                <div class="spinner_wrapper inline">
                    <i class="fas fa-search"></i>
                    <div class="spinner overlay white"></div>
                </div>
            </button>
            <button class="btn subtle hide_btn"> Wyczyść filtry <i class="fas fa-eraser"></i></button>
        </div>
    </div>

    <div class="seo_comments hidden">
        <?= join(", ", DB::fetchCol("SELECT comment FROM comment WHERE general_product_id = $general_product_id")) ?>
    </div>
    <list-comp class="comments striped" data-primary="comment_id">
        <comment-comp></comment-comp>
    </list-comp>
    <pagination-comp class="comments"></pagination-comp>

    <?php if (User::getCurrent()->isLoggedIn()) : ?>
        <div class="label medium">Podziel się swoją opinią</div>
        <button class="btn primary" onclick="showModal(`addComment`,{source:this});">
            Napisz komentarz <i class="fas fa-comment" style="margin-left:4px"></i>
        </button>
    <?php else : ?>
        <div class="label medium">Aby móc dodać komentarz musisz się zalogować</div>
        <button class="btn primary" onclick="showModal(`loginForm`,{source:this});">
            Zaloguj się <i class="fas fa-user"></i>
        </button>
    <?php endif ?>
</div>

<?php if (User::getCurrent()->isLoggedIn()) : ?>
    <div id="addComment" data-modal data-dismissable>
        <div class="modal_body" style="width: 600px;">
            <button class="close_modal_btn"><i class="fas fa-times"></i></button>

            <h3 class="modal_header">Napisz komentarz</h3>

            <div class="scroll_panel scroll_shadow panel_padding">
                <form>
                    <hr>
                    <div class="variants_container mtf">
                        <?= $variants_less_html ?>
                    </div>

                    <div class="label">
                        Ocena
                    </div>

                    <div class="rating_picker"></div>

                    <label>
                        <div class="label">Pseudonim</div>
                        <input class="field nickname" value="<?= htmlspecialchars($user_nickname) ?>">
                    </label>

                    <label>
                        <div class="label">Komentarz</div>
                        <textarea class="field comment scroll_panel" style="height:150px;min-height:80px;"></textarea>
                    </label>

                    <button class="btn primary submit_btn fill mt2" type="submit">Wyślij <i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        </div>
    </div>
<?php endif ?>

<?php
foreach ($general_product_products as $product) {
    $name = htmlspecialchars($product["__name"]);
    $gross_price = $product["gross_price"];
    $url = $product["__url"];
    $img_url = SITE_URL . $product["__img_url"];
    $stockSchema = $product["stock"] > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

    if ($product["active"] && floatval($product["gross_price"])) {
?>
        <script type="application/ld+json">
            {
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": "<?= $name ?>",
                "description": "<?= $page_data["seo_description"] ?>",
                "image": [
                    "<?= $img_url ?>"
                ],
                "brand": {
                    "@type": "Thing",
                    "name": "<?= getShopName() ?>"
                },
                <?php if ($general_product_data["__rating_count"] > 0) : ?> "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "<?= $general_product_data["__avg_rating"] ?>",
                        "reviewCount": "<?= $general_product_data["__rating_count"] ?>",
                        "bestRating": 5,
                        "worstRating": 0
                    },
                <?php endif ?> "offers": {
                    "@type": "Offer",
                    "url": "<?= SITE_URL . $url ?>",
                    "priceCurrency": "PLN",
                    "price": "<?= $gross_price ?>",
                    "itemCondition": "https://schema.org/NewCondition",
                    "availability": "<?= $stockSchema ?>",
                    "seller": {
                        "@type": "Organization",
                        "name": "<?= getShopName() ?>"
                    }
                }
            }
        </script>
<?php
    }
} ?>

<?php

Templates::endSection();

renderPage(
    $page_data["page_id"],
    [
        "default_seo_title" => $general_product_data["name"],
        "admin_edit_btn" => "<a href=\"" . Request::$static_urls["ADMIN"] . "/produkt/$general_product_id\" class=\"xbutton\">
            <span>Edytuj produkt</span>
            <i class=\"fas fa-cube\"></i>
        </a>"
    ]
);


?>