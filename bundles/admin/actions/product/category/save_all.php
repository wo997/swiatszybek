<?php //route[{ADMIN}/product/category/save_all]

try {
    DB::beginTransaction();

    $product_categories = json_decode($_POST["product_categories"], true);

    $traverse = function ($arr, $parent_id = -1) use (&$traverse) {
        $ids_we_have = [];
        foreach ($arr as $item) {
            $product_category_data = filterArrayKeys($item, ["name", "pos", "product_category_id"]);
            $product_category_data["parent_product_category_id"] = $parent_id;
            $product_category = EntityManager::getEntity("product_category", $product_category_data);
            $category_id = $product_category->getId();
            $ids_we_have[] = $category_id;
            $ids_we_have = array_merge($ids_we_have, $traverse($item["sub_categories"], $category_id));
        }
        return $ids_we_have;
    };

    $ids_we_have = $traverse($product_categories);

    $query = "SELECT product_category_id FROM product_category";
    if ($ids_we_have) {
        $query .= " WHERE product_category_id NOT IN (" . join(",", $ids_we_have) . ")";
    }

    foreach (DB::fetchCol($query) as $id) {
        $product_category = EntityManager::getEntityById("product_category", $id);
        $product_category->setWillDelete();
    }

    EntityManager::saveAll();

    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
