<?php //route[/{ADMIN}product/feature/delete]

$id = Request::urlParam(4);

try {
    DB::beginTransaction();
    $product_feature = EntityManager::getEntityById("product_feature", $id);
    $product_feature->setWillDelete();
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
