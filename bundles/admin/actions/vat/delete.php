<?php //route[{ADMIN}/vat/delete]

try {
    DB::beginTransaction();
    $vat = EntityManager::getEntityById("vat", Request::urlParam(3));
    $vat->setWillDelete();
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
