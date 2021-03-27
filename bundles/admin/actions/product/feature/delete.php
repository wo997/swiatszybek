<?php //route[{ADMIN}/product/feature/delete]

try {
    DB::beginTransaction();
    $product_feature = EntityManager::getEntityById("product_feature", Request::urlParam(4));
    $product_feature->setWillDelete();
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
