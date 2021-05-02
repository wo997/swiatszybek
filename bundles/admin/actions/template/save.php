<?php //route[{ADMIN}/template/save]

try {
    DB::beginTransaction();
    $template = EntityManager::getEntity("template", json_decode($_POST["template"], true));
    $template_id = $template->getId();
    buildPage($template_id);
    updateTemplateModificationTime($template_id);
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse($page->getSimpleProps());
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
