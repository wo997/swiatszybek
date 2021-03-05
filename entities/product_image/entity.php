<?php //hook[entity]

EntityManager::register("product_img", [
    "props" => [
        "img_url" => ["type" => "string"],
        "general_product_id" => ["type" => "number"],
        "pos" => ["type" => "number"],
        "product_feature_options" => ["type" => "product_feature_option[]"],
        //"options_json" => ["type" => "string"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "images" => ["type" => "product_img[]"]
    ],
]);

EntityManager::OneToMany(
    "general_product",
    "images",
    "product_img",
);

EntityManager::manyToMany("product_img", "product_feature_option", "product_img_to_feature_option");

// EventListener::register("before_save_product_img_entity", function ($params) {
//     /** @var Entity ProductImage */
//     $product_img = $params["obj"];
//     /** @var Entity[] ProductFeatureOption */
//     $options = $product_img->getProp("product_feature_options");
//     $options_json = [];
//     foreach ($options as $option) {
//         $options_json[] = $option->getId();
//     }
//     $product_img->setProp("options_json", json_encode($options_json));
// });
