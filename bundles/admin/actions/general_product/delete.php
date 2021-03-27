<?php //route[{ADMIN}/general_product/delete]

try {
    DB::beginTransaction();
    $general_product = EntityManager::getEntityById("general_product", Request::urlParam(3));
    $general_product->setWillDelete();
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
