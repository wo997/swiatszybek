<?php //route[{ADMIN}/user/save]

try {
    DB::beginTransaction();
    $user = EntityManager::getEntity("user", json_decode($_POST["user"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
