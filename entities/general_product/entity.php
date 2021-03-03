<?php //hook[entity]

EntityManager::register("general_product", [
    "props" => [
        "name" => ["type" => "string"],
        "__img_url" => ["type" => "string"],
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
        $images_data[] = ["img_url" => $image->getProp("img_url"), "option_ids" => $option_ids];
    }

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

    foreach ($products as $product) {
        $product_id = $product->getId();

        /** @var Entity[] ProductFeatureOption */
        $feature_options = $product->getProp("feature_options");
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
            $option_names = DB::fetchCol("SELECT pfo.name
                FROM product_to_feature_option INNER JOIN product_feature_option pfo USING (product_feature_option_id)
                WHERE product_id = $product_id
                ORDER BY FIELD(product_feature_id,$sorted_feature_ids_str)");
            $product_name .= " | " . join(" | ", $option_names);
        }

        $product->setProp("__name", $product_name);
    }

    $general_product->setProp("__img_url", $main_img_url);
});
