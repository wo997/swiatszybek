<?php //route[{ADMIN}/transaction/save]

try {
    DB::beginTransaction();
    $transaction = EntityManager::getEntity("transaction", json_decode($_POST["transaction"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
