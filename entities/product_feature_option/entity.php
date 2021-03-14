<?php //hook[entity]

EntityManager::register("product_feature_option", [
    "props" => [
        "product_feature_id" => ["type" => "number"],
        "parent_product_feature_option_id" => ["type" => "number"],
        "value" => ["type" => "string"],
        "double_value" => ["type" => "number"],
        "datetime_value" => ["type" => "string"],
        "text_value" => ["type" => "string"],
    ],
]);

EntityManager::register("product_feature", [
    "props" => [
        "options" => ["type" => "product_feature_option[]"]
    ],
]);

EntityManager::OneToMany("product_feature", "options", "product_feature_option");

EntityManager::register("product", [
    "props" => [
        "feature_options" => ["type" => "product_feature_option[]"]
    ],
]);

EntityManager::manyToMany("product", "product_feature_option", "product_to_feature_option");

EntityManager::register("general_product", [
    "props" => [
        "feature_options" => ["type" => "product_feature_option[]"]
    ],
]);

EntityManager::manyToMany(
    "general_product",
    "product_feature_option",
    "general_product_to_feature_option",
    [
        "meta" => [
            "pos" => ["type" => "number"],
        ]
    ]
);

EventListener::register("before_save_product_feature_option_entity", function ($params) {
    /** @var Entity ProductFeatureOption */
    $product_feature_option = $params["obj"];

    /** @var Entity ProductFeature */
    $product_feature = $product_feature_option->getParent("product_feature");

    // shit happens, data may be broken, chill
    if (!$product_feature) {
        $product_feature_option->setWillDelete();
    } else {
        $feature_data_type = $product_feature->getProp("data_type");

        if (!endsWith($feature_data_type, "_list")) {
            $display_something = "";

            $text_value = null;
            if ($feature_data_type === "text_value") {
                $text_value = $product_feature_option->getProp("text_value");
                if ($text_value !== false) {
                    $display_something = $text_value;
                } else {
                    $text_value = "";
                }
            }
            $product_feature_option->setProp("text_value", $text_value);

            $double_value = null;
            if ($feature_data_type === "double_value") {
                $double_value = $product_feature_option->getProp("double_value");
                if ($double_value !== false) {
                    $display_something = $double_value;

                    $physical_measure = $product_feature->getProp("physical_measure");
                    $display_something = prettyPrintPhysicalMeasure($double_value, $physical_measure);
                } else {
                    $double_value = 0;
                }
            }
            $product_feature_option->setProp("double_value", $double_value);

            $datetime_value = null;
            if ($feature_data_type === "datetime_value") {
                $datetime_value = $product_feature_option->getProp("datetime_value");
                if ($datetime_value !== false) {
                    $display_something = $datetime_value;
                } else {
                    $datetime_value = "";
                }
            }
            $product_feature_option->setProp("datetime_value", $datetime_value);

            $product_feature_option->setProp("value", $display_something);
        }
    }
});
