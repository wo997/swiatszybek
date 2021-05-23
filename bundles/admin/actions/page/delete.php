<?php //route[{ADMIN}/page/delete]

try {
    DB::beginTransaction();
    $page = EntityManager::getEntityById("page", Request::urlParam(3));
    $page->setWillDelete();
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
