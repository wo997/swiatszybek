<?php //route[{ADMIN}/template/delete]

try {
    DB::beginTransaction();
    $template = EntityManager::getEntityById("template", Request::urlParam(3));
    $template->setWillDelete();
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
