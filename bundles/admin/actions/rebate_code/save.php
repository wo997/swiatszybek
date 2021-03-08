<?php //route[{ADMIN}/rebate_code/save]

try {
    DB::beginTransaction();
    $rebate_code = EntityManager::getEntity("rebate_code", json_decode($_POST["rebate_code"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["success" => true]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
