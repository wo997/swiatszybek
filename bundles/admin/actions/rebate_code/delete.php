<?php //route[{ADMIN}/rebate_code/delete]

try {
    DB::beginTransaction();
    $rebate_code = EntityManager::getEntityById("rebate_code", Request::urlParam(3));
    $rebate_code->setWillDelete();
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
