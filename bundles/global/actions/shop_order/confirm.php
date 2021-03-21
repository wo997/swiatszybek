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
    // sometimes it should be p24, but you can easily do a double redirect, only once though, "zaplac" will help
    Request::redirect($shop_order->getProp("__url") . "?zaplac");
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
