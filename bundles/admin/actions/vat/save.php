<?php //route[{ADMIN}/vat/save]

try {
    DB::beginTransaction();
    $vat = EntityManager::getEntity("vat", json_decode($_POST["vat"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse($vat->getSimpleProps());
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
