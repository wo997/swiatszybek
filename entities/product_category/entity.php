<?php //hook[entity]

EntityManager::register("product_category", [
    "props" => [
        "product_category_id" => ["type" => "number"],
        "parent_product_category_id" => ["type" => "number"],
        "name" => ["type" => "string"],
        "pos" => ["type" => "number"],
        "__url" => ["type" => "string"],
        "__level" => ["type" => "number"],
        "__category_path_json" => ["type" => "string"],
        "__category_path_names_csv" => ["type" => "string"],
        "__product_count" => ["type" => "number"],
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

    $category_path = [];
    $category_path_names = [];

    /** @var Entity ProductCategory */
    $parent_product_category = $product_category;
    while (true) {
        array_unshift($category_path, ["id" => $parent_product_category->getId(), "name" => $parent_product_category->getProp("name")]);
        array_unshift($category_path_names, str_replace(",", "", $parent_product_category->getProp("name")));

        $parent_product_category_id = $parent_product_category->getProp("parent_product_category_id");
        if ($parent_product_category_id === -1) {
            break;
        }
        $parent_product_category = EntityManager::getEntityById("product_category", $parent_product_category_id);
        if (!$parent_product_category) {
            break;
        }
    }

    $product_category_link = getProductCategoryLink($category_path);
    $product_category->setProp("__url", $product_category_link);
    $product_category->setProp("__category_path_json", json_encode($category_path));
    $product_category->setProp("__category_path_names_csv", join(",", $category_path_names));
    $product_category->setProp("__level", count($category_path_names));
});

EventListener::register("after_save_product_category_entity", function ($params) {
    /** @var Entity ProductCategory */
    $product_category = $params["obj"];

    $pc_id_query = "product_category_id = " . $product_category->getId();
    $product_count = DB::fetchVal("SELECT COUNT(1) FROM general_product_to_category INNER JOIN general_product gp USING (general_product_id) INNER JOIN product p USING (general_product_id) WHERE gp.active AND p.active AND $pc_id_query");
    DB::update("product_category", ["__product_count" => $product_count], $pc_id_query);
});
