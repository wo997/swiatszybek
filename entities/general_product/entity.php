<?php //hook[entity]

EntityManager::register("general_product", [
    "props" => [
        "name" => ["type" => "string"],
        "__img_url" => ["type" => "string"],
        "__images_json" => ["type" => "string"],
        "__options_json" => ["type" => "string"],
        "__search" => ["type" => "TEXT"],
    ],
]);

EventListener::register("before_save_general_product_entity", function ($params) {
    /** @var Entity GeneralProduct */
    $general_product = $params["obj"];

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
        $images_data[] = ["img_url" => $image->getProp("img_url"), "option_ids" => $option_ids, "pos" => $image->getProp("pos")];
    }
    usort($images_data, fn ($a, $b) => $a["pos"] <=> $b["pos"]);

    /** @var Entity[] Product */
    $products = $general_product->getProp("products");

    /** @var Entity[] ProductFeature */
    $general_product_features = $general_product->getProp("features");
    $features = [];
    foreach ($general_product_features as $general_product_feature) {
        $features[] = ["id" => $general_product_feature->getProp("product_feature_id"), "pos" => $general_product_feature->getMeta()["pos"]];
    }
    usort($features, fn ($a, $b) => $a["pos"] <=> $b["pos"]);
    $sorted_feature_ids_str = join(",", array_map(fn ($a) => $a["id"], $features));

    $main_img_url = "";

    /** @var Entity[] ProductFeatureOption */
    $general_product_feature_options = $general_product->getProp("feature_options");
    $all_options = [];
    $all_option_ids = [];
    foreach ($general_product_feature_options as $option) {
        $option_id = $option->getId();
        $feature_id = $option->getProp("product_feature_id");
        if (!isset($all_options[$feature_id])) {
            $all_options[$feature_id] = [];
        }
        if (!in_array($option_id, $all_options[$feature_id])) {
            $all_options[$feature_id][] = $option_id;
        }
        if (!in_array($option_id, $all_option_ids)) {
            $all_option_ids[] = $option_id;
        }
    }
    $alone_options = [];
    foreach ($all_options as $feature_id => $option_ids) {
        if (count($option_ids) === 1) {
            $alone_options[] = EntityManager::getEntityById("product_feature_option", $option_ids[0]);
        }
    }

    foreach ($products as $product) {
        $product_id = $product->getId();

        /** @var Entity[] ProductFeatureOption */
        $feature_options = $product->getProp("feature_options");
        /** @var Entity[] ProductFeatureOption */
        $feature_options = array_merge($feature_options, $alone_options);
        foreach ($feature_options as $key => $feature_option) {
            if (!in_array($feature_option->getId(), $all_option_ids)) {
                unset($feature_options[$key]); // not tested but seems legit
            }
        }
        /** @var Entity[] ProductFeatureOption */
        $feature_options = array_values($feature_options);
        $product->setProp("feature_options", $feature_options);

        $feature_option_ids = [];
        foreach ($feature_options as $feature_option) {
            $feature_option_ids[] = $feature_option->getId();
        }

        $__img_url = "";
        $most_matches = -1;
        foreach ($images_data as $image_data) {
            $matches = 0;
            foreach ($feature_option_ids as $feature_option_id) {
                if (in_array($feature_option_id, $image_data["option_ids"])) {
                    $matches++;
                }
            }
            if (!$main_img_url) {
                $main_img_url = $image_data["img_url"];
            }
            if ($matches > $most_matches) {
                $most_matches = $matches;
                $__img_url = $image_data["img_url"];
            }
        }

        $product->setProp("__img_url", $__img_url);

        $product_name = $general_product->getProp("name");

        if ($sorted_feature_ids_str) {
            $option_values = DB::fetchCol("SELECT pfo.value
                FROM product_to_feature_option INNER JOIN product_feature_option pfo USING (product_feature_option_id)
                WHERE product_id = $product_id
                ORDER BY FIELD(product_feature_id,$sorted_feature_ids_str)");

            foreach ($option_values as $option_name) {
                if ($option_name) {
                    $product_name .= " | " . $option_name;
                }
            }
        }

        $product->setProp("__name", $product_name);
    }

    $general_product->setProp("__img_url", $main_img_url);
    $general_product->setProp("__images_json", json_encode($images_data));
    $general_product->setProp("__options_json", $all_options ? json_encode($all_options) : "{}");

    $search = "";
    $search .= replacePolishLetters($general_product->getProp("name"));


    /** @var Entity[] ProductCategory */
    $general_product_categories = $general_product->getProp("categories");
    foreach ($general_product_categories as $category) {
        // we could also make here that the parent categories are included here
        $search .= " " . $category->getProp("name");
    }

    $search = getSearchableString($search);
    $general_product->setProp("__search", $search);
});

EventListener::register("after_save_general_product_entity", function ($params) {
    /** @var Entity GeneralProduct */
    $general_product = $params["obj"];
    $general_product_id = $general_product->getId();

    $non_list_option_ids = DB::fetchCol("SELECT DISTINCT product_feature_option_id
        FROM general_product_to_feature_option
        INNER JOIN product_feature_option USING (product_feature_option_id)
        INNER JOIN product_feature USING (product_feature_id)
        WHERE general_product_id = $general_product_id
        AND data_type NOT LIKE '%_list%'");

    $non_list_option_ids_csv = $non_list_option_ids ? join(",", $non_list_option_ids) : "-1";

    DB::execute("DELETE pfo
        FROM product_feature_option pfo
        INNER JOIN general_product_to_feature_option USING (product_feature_option_id)
        INNER JOIN product_feature USING (product_feature_id)
        WHERE general_product_id = $general_product_id
        AND data_type NOT LIKE '%_list%'
        AND product_feature_option_id NOT IN ($non_list_option_ids_csv)");

    //DB::execute("DELETE pfo FROM product_feature_option pfo WHERE product_feature_id = 0"); // not needed
});
