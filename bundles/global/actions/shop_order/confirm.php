<?php //route[/shop_order/confirm]

try {
    DB::beginTransaction();
    $shop_order = confirmOrder(json_decode($_POST["shop_order"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    // sometimes it should be p24, but you can easily do a double redirect, only once though, "zaplac" will help
    Request::redirect($shop_order->getProp("__url") . "?zaplac");
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
