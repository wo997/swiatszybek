<?php //route[/shop_order/confirm]

try {
    DB::beginTransaction();
    $shop_order = EntityManager::getEntity("shop_order", json_decode($_POST["shop_order"], true));
    if (!$shop_order->is_new) {
        // someone trying to do nasty things
        Request::jsonResponse(["success" => false]);
    }
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::redirect($shop_order->getProp("__url"));
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
