<?php //hook[entity]

EntityManager::register("product_category", [
    "props" => [
        "product_category_id" => ["type" => "number"],
        "parent_product_category_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "__full_name" => ["type" => "string"],
        "pos" => ["type" => "number"],
    ],
]);

EntityManager::register("general_product", [
    "props" => [
        "categories" => ["type" => "product_category[]"]
    ],
]);

EntityManager::manyToMany("general_product", "product_category", "general_product_to_category");

EventListener::register("before_save_product_category_entity", function ($params) {
    /** @var Entity ProductCategory */
    $product_category = $params["obj"];

    $full_name = str_replace("/", "", $product_category->getProp("name"));

    /** @var Entity ProductCategory */
    $parent_product_category = $product_category;
    while (true) {
        $parent_product_category_id = $parent_product_category->getProp("parent_product_category_id");
        if ($parent_product_category_id === -1) {
            break;
        }
        $parent_product_category = EntityManager::getEntityById("product_category", $parent_product_category_id);
        if (!$parent_product_category) {
            break;
        }
        $full_name = str_replace("/", "", $parent_product_category->getProp("name")) . "/" . $full_name;
    }

    $product_category->setProp("__full_name", $full_name);
});
