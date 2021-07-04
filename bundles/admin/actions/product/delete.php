<?php //route[{ADMIN}/product/delete]

// TODO: entity should do a check for dependencies (STOCK!) ;)
// stock is separate not to be bloated so it's completely manual now, a simple query though :)
try {
    DB::beginTransaction();
    $product = EntityManager::getEntityById("product", Request::urlParam(3));
    $product->setWillDelete();
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
