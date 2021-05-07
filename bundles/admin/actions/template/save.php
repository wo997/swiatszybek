<?php //route[{ADMIN}/template/save]

try {
    DB::beginTransaction();
    $template = EntityManager::getEntity("template", json_decode($_POST["template"], true));
    $template_id = $template->getId();
    buildPageable("template", $template_id);
    updatePageableModificationTime("template", $template_id);
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse($template->getSimpleProps());
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
