<?php //route[{ADMIN}/template/save]

try {
    DB::beginTransaction();
    $template = EntityManager::getEntity("template", json_decode($_POST["template"], true));
    $template_id = $template->getId();
    updateTemplateModificationTime($template_id);
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse($template->getSimpleProps());
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
