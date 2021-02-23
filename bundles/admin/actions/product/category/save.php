<?php //route[{ADMIN}product/category/save]

try {
    DB::beginTransaction();
    $product_category = EntityManager::getEntity("product_category", json_decode($_POST["product_category"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
