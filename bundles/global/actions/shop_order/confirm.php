<?php //route[/shop_order/confirm]

try {
    DB::beginTransaction();
    // TODO:: filter keys so no vulnerable data is injected?
    $shop_order = confirmOrder(json_decode($_POST["shop_order"], true));
    EntityManager::saveAll();
    $cart = User::getCurrent()->getCart();
    $cart->empty();
    $cart->save();
    DB::commitTransaction();

    EventListener::dispatch("shop_order_created", ["shop_order_id" => $shop_order->getId()]);

    Request::setSingleUsageSessionVar("force_payment", true);
    Request::redirect($shop_order->getProp("__url"));
} catch (Exception $e) {
    //var_dump($e);
    DB::rollbackTransation();
    Request::jsonResponse(["success" => false]);
}
