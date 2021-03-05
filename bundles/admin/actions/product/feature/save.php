<?php //route[/{ADMIN}product/feature/save]

try {
    DB::beginTransaction();
    $product_feature = EntityManager::getEntity("product_feature", json_decode($_POST["product_feature"], true));
    EntityManager::saveAll();
    sortTable("product_feature");
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
