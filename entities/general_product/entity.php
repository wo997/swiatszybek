<?php //hook[entity]

EntityManager::register("general_product", [
    "props" => [
        "name" => ["type" => "string"],
        "main_img_url" => ["type" => "string"],
    ],
]);

EventListener::register("before_save_general_product_entity", function ($params) {
    /** @var Entity */
    $general_product = $params["obj"];

    /** @var Entity[] */
    $images = $general_product->getProp("images");
    $images_data = [];
    foreach ($images as $image) {
        /** @var Entity[] */
        $product_feature_options = $image->getProp("product_feature_options");
        $option_ids = [];
        foreach ($product_feature_options as $product_feature_option) {
            $option_ids[] = $product_feature_option->getId();
        }
        $images_data[] = ["img_url" => $image->getProp("img_url"), "option_ids" => $option_ids];
    }

    /** @var Entity[] */
    $products = $general_product->getProp("products");

    foreach ($products as $product) {
        /** @var Entity[] */
        $feature_options = $product->getProp("feature_options");
        $feature_option_ids = [];
        foreach ($feature_options as  $feature_option) {
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
            if ($matches > $most_matches) {
                $most_matches = $matches;
                $__img_url = $image_data["img_url"];
            }
        }

        $product->setProp("__img_url", $__img_url);
    }
});
