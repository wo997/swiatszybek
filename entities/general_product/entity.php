<?php //hook[entity]

EntityManager::register("general_product", [
    "props" => [
        "name" => ["type" => "string"],
        "active" => ["type" => "number"],
        "product_type" => ["type" => "string"],
        "__img_url" => ["type" => "string"],
        "__images_json" => ["type" => "string"],
        "__options_json" => ["type" => "string"],
        "__search" => ["type" => "string"],
        "__url" => ["type" => "string"],
        "__features_html" => ["type" => "string"],
        "compare_sales" => ["type" => "number"],
    ],
]);

EventListener::register("before_save_general_product_entity", function ($params) {
    /** @var Entity GeneralProduct */
    $general_product = $params["obj"];
    $general_product_id = $general_product->getId();

    /** @var Entity[] ProductImage */
    $images = $general_product->getProp("images");
    $images_data = [];
    foreach ($images as $image) {
        /** @var Entity[] ProductFeatureOption */
        $product_feature_options = $image->getProp("product_feature_options");
        $option_ids = [];
        foreach ($product_feature_options as $product_feature_option) {
            $option_ids[] = $product_feature_option->getId();
        }
        $images_data[] = ["img_url" => $image->getProp("img_url"), "feature_option_ids" => $option_ids, "pos" => $image->getProp("pos")];
    }
    usort($images_data, fn ($a, $b) => $a["pos"] <=> $b["pos"]);

    /** @var Entity[] Product */
    $products = $general_product->getProp("products");

    /** @var Entity[] ProductVariant */
    $general_product_variants = $general_product->getProp("variants");
    $variants_data = [];
    $all_variant_options = [];
    $all_feature_option_ids_in_variants = [];
    foreach ($general_product_variants as $variant) {
        $product_variant_id = $variant->getProp("product_variant_id");
        $variants_data[] = ["id" => $product_variant_id, "pos" => $variant->getProp("pos")];

        /** @var Entity[] ProductVariantOption */
        $variant_options = $variant->getProp("options");
        foreach ($variant_options as $variant_option) {
            /** @var Entity[] ProductFeatureOption */
            $variant_option_feature_options = $variant_option->getProp("product_feature_options");
            foreach ($variant_option_feature_options as $variant_option_feature_option) {
                $vofoid = $variant_option_feature_option->getId();
                if (!in_array($vofoid, $all_feature_option_ids_in_variants)) {
                    $all_feature_option_ids_in_variants[] = $vofoid;
                }
            }

            if (!isset($all_variant_options[$product_variant_id])) {
                $all_variant_options[$product_variant_id] = [];
            }
            $product_variant_option_id = $variant_option->getProp("product_variant_option_id");
            if (!isset($all_variant_options[$product_variant_id][$product_variant_option_id])) {
                $all_variant_options[$product_variant_id][] = $product_variant_option_id;
            }
        }
    }
    usort($variants_data, fn ($a, $b) => $a["pos"] <=> $b["pos"]);
    $sorted_variant_ids = array_column($variants_data, "id");

    // it's decent but a variant view is also cool in other ways
    $features_html = "";
    $features_html_curr_extra = null;

    /** @var Entity[] ProductFeatureOption */
    $general_product_feature_options = $general_product->getProp("feature_options");
    usort($general_product_feature_options, fn ($a, $b) => $a->getMeta("pos") <=> $b->getMeta("pos"));

    $all_feature_options = [];
    foreach ($general_product_feature_options as $option) {
        $option_id = $option->getId();
        $product_feature = $option->getParent("product_feature");
        if (!$product_feature) {
            continue;
        }
        $feature_id = $product_feature->getId();
        if (!isset($all_feature_options[$feature_id])) {
            $all_feature_options[$feature_id] = [];
            if ($features_html) {
                $features_html .= "</ul>";
            }

            $features_html .= "<ul><li>" . htmlspecialchars($product_feature->getProp("name")) . "</li>";
            $features_html_curr_extra = $product_feature->getProp("extra");
        }
        if (!in_array($option_id, $all_feature_options[$feature_id])) {
            $all_feature_options[$feature_id][] = $option_id;
            $features_html .= "<li>";

            if ($features_html_curr_extra === "color") {
                $extra = json_decode($option->getProp("extra_json"), true);
                $color = "#ffffff";
                if ($extra) {
                    $color = def($extra, "color", "");
                    $features_html .= "<span class=\"color_circle\" style=\"background:$color\"></span>";
                }
            }

            $features_html .= htmlspecialchars($option->getProp("value")) . "</li>";
        }

        // what's shared, what's not, for searching
        // TODO: ext silent _meta_?
        $option->setProp("_meta_is_shared", in_array($option_id, $all_feature_option_ids_in_variants) ? 0 : 1);
    }

    if ($features_html) {
        $features_html .= "</ul>";
    }

    $general_product->setProp("__features_html", $features_html);

    $main_img_url = "";
    $first_img = def($images_data, 0, null);
    if ($first_img) {
        $main_img_url = $first_img["img_url"];
    }

    foreach ($products as $product) {
        /** @var Entity[] ProductVariantOption */
        $variant_options = $product->getProp("variant_options");

        $feature_option_ids = [];
        foreach ($variant_options as $variant_option) {
            /** @var Entity[] ProductFeatureOption */
            $product_feature_options = $variant_option->getProp("product_feature_options");
            foreach ($product_feature_options as $product_feature_option) {
                $feature_option_ids[] = $product_feature_option->getId();
            }
        }

        $__img_url = "";
        $most_matches = -1;
        foreach ($images_data as $image_data) {
            $matches = 0;
            foreach ($feature_option_ids as $feature_option_id) {
                if (in_array($feature_option_id, $image_data["feature_option_ids"])) {
                    $matches++;
                }
            }
            if ($matches > $most_matches) {
                $most_matches = $matches;
                $__img_url = $image_data["img_url"];
            }
        }

        $product->setProp("__img_url", $__img_url);

        $product_name = $general_product->getProp("name");

        $specific_option_ids = [];
        $specific_option_values = [];

        /** @var Entity[] ProductVariantOption */
        $product_variant_options = $product->getProp("variant_options");

        $product_variant_options_data = [];
        foreach ($product_variant_options as $product_variant_option) {
            $product_variant_option_id = $product_variant_option->getId();
            // if (in_array($product_variant_option_id, $alone_option_ids)) {
            //     continue;
            // }
            $product_variant_options_data[] = [
                "name" => $product_variant_option->getProp("name"),
                "pos" => array_search($product_variant_option->getProp("product_variant_id"), $sorted_variant_ids),
                "id" => $product_variant_option_id,
            ];
        }
        usort($product_variant_options_data, fn ($a, $b) => $a["pos"] <=> $b["pos"]);

        foreach ($product_variant_options_data as $option_data) {
            if ($option_data["name"]) {
                $product_name .= " | " . $option_data["name"];
            }
        }

        $specific_option_ids = array_column($product_variant_options_data, "id");
        $specific_option_values = array_column($product_variant_options_data, "value");

        $product_url = "";

        $product->setProp("__name", $product_name);

        $product_url = getProductLink($general_product_id, $general_product->getProp("name"), $specific_option_ids, $specific_option_values);
        $product->setProp("__url", $product_url);
    }

    $general_product->setProp("__img_url", $main_img_url);
    $general_product->setProp("__images_json", json_encode($images_data));
    $general_product->setProp("__options_json", $all_variant_options ? json_encode($all_variant_options) : "{}");

    $search = "";
    $search .= $general_product->getProp("name");

    /** @var Entity[] ProductCategory */
    $general_product_categories = $general_product->getProp("categories");
    foreach ($general_product_categories as $category) {
        // we could also make here that the parent categories are included here
        $search .= " " . $category->getProp("name");
    }

    $search = getSearchableString($search);
    $general_product->setProp("__search", $search);

    /** @var Entity[] Comment */
    $comments = $general_product->getProp("comments"); // considering fetching it only when the comment said to do so, or it was fetched previously ezy?
    $rating_count = 0;
    $rating_sum = 0;
    foreach ($comments as $comment) {
        $rating = intval($comment->getProp("rating"));
        if ($rating) {
            // count just existing ones, not 0s
            $rating_count++;
            $rating_sum += $rating;
        }
    }
    $avg_rating = $rating_count > 0 ? round(10 * $rating_sum / $rating_count) * 0.1 : 0;
    $general_product->setProp("__rating_count", $rating_count);
    $general_product->setProp("__avg_rating", $avg_rating);

    $general_product_url = getProductLink($general_product_id, $general_product->getProp("name"));
    $general_product->setProp("__url", $general_product_url);
});

EventListener::register("after_save_general_product_entity", function ($params) {
    // in case it's slow (I doubt tho) just run it as a cron job

    /** @var Entity GeneralProduct */
    $general_product = $params["obj"];
    $general_product_id = $general_product->getId();

    $non_list_option_ids = DB::fetchCol("SELECT DISTINCT product_feature_option_id
        FROM general_product_to_feature_option gptfo
        INNER JOIN product_feature_option USING (product_feature_option_id)
        INNER JOIN product_feature pf USING (product_feature_id)
        WHERE gptfo.general_product_id = $general_product_id
        AND data_type NOT LIKE '%_list%'");

    $non_list_option_ids_csv = $non_list_option_ids ? join(",", $non_list_option_ids) : "-1";

    // idk why but it might work
    // DB::execute("DELETE pfo
    //     FROM product_feature_option pfo
    //     INNER JOIN general_product_to_feature_option gptfo USING (product_feature_option_id)
    //     INNER JOIN product_feature pf USING (product_feature_id)
    //     WHERE gptfo.general_product_id = $general_product_id
    //     AND data_type NOT LIKE '%_list%'
    //     AND product_feature_option_id NOT IN ($non_list_option_ids_csv)");

    //DB::execute("DELETE FROM product_feature_option WHERE just_general_product_id = $general_product_id AND product_feature_option_id NOT IN ($non_list_option_ids_csv)");

    $compare_sales = DB::fetchVal("SELECT SUM(compare_sales) FROM product WHERE general_product_id = $general_product_id");
    DB::execute("UPDATE general_product SET compare_sales = ? WHERE general_product_id = $general_product_id", [$compare_sales]);
});
