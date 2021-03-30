<?php //route[/shop_order/confirm]

try {
    DB::beginTransaction();
    // TODO:: filter keys so no vulnerable data is injected?
    $shop_order = confirmOrder(json_decode($_POST["shop_order"], true));
    EntityManager::saveAll();
    $cart = User::getCurrent()->cart;
    $cart->empty();
    $cart->save();
    DB::commitTransaction();
    // sometimes it should be p24, but you can easily do a double redirect, only once though, "zaplac" will help
    Request::redirect($shop_order->getProp("__url") . "?zaplac");
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
