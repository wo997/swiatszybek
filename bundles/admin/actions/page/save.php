<?php //route[{ADMIN}/page/save]

try {
    DB::beginTransaction();
    $page = EntityManager::getEntity("page", json_decode($_POST["page"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse($page->getSimpleProps());
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
