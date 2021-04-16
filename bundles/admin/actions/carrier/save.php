<?php //route[{ADMIN}/carrier/save]

try {
    DB::beginTransaction();
    $carrier = EntityManager::getEntity("carrier", json_decode($_POST["carrier"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["carrier" => $carrier->getSimpleProps()]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
