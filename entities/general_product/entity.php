<?php //hook[entity]

EntityManager::register("general_product", [
    "props" => [
        "name" => ["type" => "string"],
        "active" => ["type" => "number"],
        "__img_url" => ["type" => "string"],
        "__images_json" => ["type" => "string"],
        "__options_json" => ["type" => "string"],
        "__search" => ["type" => "string"],
        "__url" => ["type" => "string"],
        "__options_html" => ["type" => "string"],
        // "seo_title" => ["type" => "string"], // THINK ABOUT IT FIRST
        // "seo_description" => ["type" => "string"],
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
    $variants = [];
    foreach ($general_product_variants as $general_product_variant) {
        $variants[] = ["id" => $general_product_variant->getProp("product_variant_id"), "pos" => $general_product_variant->getProp("pos")];
    }
    usort($variants, fn ($a, $b) => $a["pos"] <=> $b["pos"]);
    $sorted_variant_ids = array_column($variants, "id");

    $options_html = "";
    $options_html_curr_extra = null;

    /** @var Entity[] ProductFeatureOption */
    $general_product_feature_options = $general_product->getProp("feature_options");
    usort($general_product_feature_options, fn ($a, $b) => $a->getProp("pos") <=> $b->getProp("pos"));

    $all_options = [];
    $all_option_ids = [];
    foreach ($general_product_feature_options as $option) {
        $option_id = $option->getId();
        $product_feature = $option->getParent("product_feature");
        $feature_id = $product_feature->getId();
        if (!isset($all_options[$feature_id])) {
            $all_options[$feature_id] = [];
            if ($options_html) {
                $options_html .= "</ul>";
            }

            $options_html .= "<ul><li>" . htmlspecialchars($product_feature->getProp("name")) . "</li>";
            $options_html_curr_extra = $product_feature->getProp("extra");
        }
        if (!in_array($option_id, $all_options[$feature_id])) {
            $all_options[$feature_id][] = $option_id;
            $options_html .= "<li>";

            if ($options_html_curr_extra === "color") {
                $extra = json_decode($option->getProp("extra_json"), true);
                $color = "#ffffff";
                if ($extra) {
                    $color = def($extra, "color", "");
                    $options_html .= "<span class=\"color_circle\" style=\"background:$color\"></span>";
                }
            }

            $options_html .= htmlspecialchars($option->getProp("value")) . "</li>";
        }
        if (!in_array($option_id, $all_option_ids)) {
            $all_option_ids[] = $option_id;
        }
    }

    $options_html .= "</ul>";

    $general_product->setProp("__options_html", $options_html);



    // DEFINITELY WRONG !!!!
    // $alone_options = [];
    // $alone_option_ids = [];
    // foreach ($all_options as $feature_id => $option_ids) {
    //     if (count($option_ids) === 1) {
    //         $alone_options[] = EntityManager::getEntityById("product_feature_option", $option_ids[0]);
    //         $alone_option_ids[] = $option_ids[0];
    //     }
    // }

    $main_img_url = "";
    $first_img = def($images_data, 0, null);
    if ($first_img) {
        $main_img_url = $first_img["img_url"];
    }

    foreach ($products as $product) {
        /** @var Entity[] ProductVariantOption */
        $variant_options = $product->getProp("variant_options");
        ///** @var Entity[] ProductVariantOption */
        //$variant_options = array_merge($variant_options, $alone_options);
        // foreach ($variant_options as $key => $variant_option) {
        //     if (!in_array($variant_option->getId(), $all_option_ids)) {
        //         unset($variant_options[$key]); // not tested but seems legit
        //     }
        // }
        // /** @var Entity[] ProductVariantOption */
        // $variant_options = array_values($variant_options);
        // $product->setProp("variant_options", $variant_options);

        $variant_option_ids = [];
        foreach ($variant_options as $variant_option) {
            $variant_option_ids[] = $variant_option->getId();
        }

        $__img_url = "";
        $most_matches = -1;
        foreach ($images_data as $image_data) {
            $matches = 0;
            foreach ($variant_option_ids as $variant_option_id) {
                if (in_array($variant_option_id, $image_data["feature_option_ids"])) {
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
    $general_product->setProp("__options_json", $all_options ? json_encode($all_options) : "{}");

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
    DB::execute("DELETE pfo
        FROM product_feature_option pfo
        INNER JOIN general_product_to_feature_option gptfo USING (product_feature_option_id)
        INNER JOIN product_feature pf USING (product_feature_id)
        WHERE gptfo.general_product_id = $general_product_id
        AND data_type NOT LIKE '%_list%'
        AND product_feature_option_id NOT IN ($non_list_option_ids_csv)");

    DB::execute("DELETE FROM product_feature_option WHERE just_general_product_id = $general_product_id AND product_feature_option_id NOT IN ($non_list_option_ids_csv)");
});
