<?php //route[{ADMIN}/page/save]

try {
    DB::beginTransaction();
    $page = EntityManager::getEntity("page", json_decode($_POST["page"], true));
    $page_id = $page->getId();
    updatePageableModificationTime("page", $page_id);
    EntityManager::saveAll();
    DB::commitTransaction();

    buildPageable("page", $page_id);
    Request::jsonResponse($page->getSimpleProps());
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
