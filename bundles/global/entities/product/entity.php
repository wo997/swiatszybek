<?php //hook[entity]

EntityManager::register("product", [
    "props" => [
        "general_product_id" => ["type" => "number"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "discount_price" => ["type" => "number"],
        "discount_untill" => ["type" => "string"],
        "vat_id" => ["type" => "number"],
        "active" => ["type" => "number"],
        "stock" => ["type" => "number"],
        "weight" => ["type" => "number"],
        "length" => ["type" => "number"],
        "width" => ["type" => "number"],
        "height" => ["type" => "number"],

        "img_url" => ["type" => "string"],
        "__img_url" => ["type" => "string"],

        "name" => ["type" => "string"],
        "__name" => ["type" => "string"],

        "__options_json" => ["type" => "string"],
        "__url" => ["type" => "string"],
        "compare_sales" => ["type" => "number"],

        "__current_gross_price" => ["type" => "number"],
        "__discount_percent" => ["type" => "number"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "products" => ["type" => "product[]"]
    ],
]);

EntityManager::oneToMany("general_product", "products", "product", ["parent_required" => true, "parent_required_action" => "unlink"]);

EventListener::register("before_save_product_entity", function ($params) {
    /** @var Entity Product */
    $product = $params["obj"];
    $product_id = $product->getId();

    /** @var Entity GeneralProduct */
    $general_product = $product->getParent("general_product");

    if ($general_product) {
        /** @var Entity[] ProductVariantOption */
        $variant_options = $product->getProp("variant_options");
        if ($variant_options) {
            $options = [];
            foreach ($variant_options as $variant_option) {
                $option_id = $variant_option->getId();

                /** @var Entity ProductVariant */
                $variant = $variant_option->getParent("product_variant");
                if (!$variant) {
                    continue;
                }
                $variant_id = $variant->getId();

                if (!isset($options[$variant_id])) {
                    $options[$variant_id] = [];
                }
                if (!in_array($option_id, $options[$variant_id])) {
                    $options[$variant_id][] = $option_id;
                }
            }
            $product->setProp("__options_json", $options ? json_encode($options) : "{}");
        }
    } else {
        setProductDefaults($product_id);
    }

    $discount_price = $product->getProp("discount_price");
    $gross_price = $product->getProp("gross_price");
    $__current_gross_price = $discount_price !== NULL ? $discount_price : $gross_price;
    $__discount_percent = 0;
    if (floatval($gross_price) > 0) {
        $__discount_percent = (1 - $__current_gross_price / $gross_price) * 100;
    }
    $product->setProp("__current_gross_price", $__current_gross_price);
    $product->setProp("__discount_percent", $__discount_percent);
});

EventListener::register("set_product_entity_stock", function ($params) {
    $val = $params["val"];
    if ($val < 0) {
        return 0;
    }
});
