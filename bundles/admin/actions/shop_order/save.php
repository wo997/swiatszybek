<?php //route[{ADMIN}/shop_order/save]

try {
    DB::beginTransaction();
    $shop_order = EntityManager::getEntity("shop_order", json_decode($_POST["shop_order"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
