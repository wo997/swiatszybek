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
    $shop_order_link = getShopOrderLink($shop_order->getId(), $shop_order->getProp("reference"));
    Request::redirect($shop_order_link);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
