<?php //hook[entity]

EntityManager::register("shop_order", [
    "props" => [
        "reference" => ["type" => "string"],
        "__url" => ["type" => "string"],
        "status" => ["type" => "order_status"],
        "user_id" => ["type" => "number"],
        "main_address" => ["type" => "address"],
        "courier_address" => ["type" => "address"],
        "parcel_locker" => ["type" => "parcel_locker"],
        "products_price" => ["type" => "number"],
        "delivery_price" => ["type" => "number"],
        "total_price" => ["type" => "number"],
        "delivery_id" => ["type" => "number"],
        "rebate_codes" => ["type" => "string"],
        "ordered_products" => ["type" => "ordered_product[]"],
        "ordered_at" => ["type" => "string"],
        "paid_at" => ["type" => "string"],
    ],
]);

EntityManager::oneToMany("shop_order", "ordered_products", "ordered_product", ["parent_required" => true]);

EntityManager::register("user", [
    "props" => [
        "shop_orders" => ["type" => "shop_order[]"]
    ],
]);

EntityManager::oneToMany("user", "shop_orders", "shop_order");

EntityManager::oneToOne("shop_order", "main_address", "address");

EntityManager::oneToOne("shop_order", "courier_address", "address");

EntityManager::oneToOne("shop_order", "parcel_locker", "parcel_locker");

EntityManager::oneToOne("shop_order", "status", "order_status");

EventListener::register("before_save_shop_order_entity", function ($params) {
    /** @var Entity ShopOrder */
    $shop_order = $params["obj"];
    $shop_order->setProp("__url", getShopOrderLink($shop_order->getProp("shop_order_id"), $shop_order->getProp("reference")));
});

EventListener::register("set_shop_order_entity_status_id", function ($params) {
    /** @var Entity ShopOrder */
    $shop_order = $params["obj"];

    $status_id = $params["val"];

    $curr_status_id = $shop_order->getCurrProp("status_id");

    $curr_in_stock = isOrderStatusInStock($curr_status_id);
    $in_stock = isOrderStatusInStock($status_id);

    if ($curr_in_stock && !$in_stock) {
        changeStockFromOrder($shop_order->getId(), -1);
    }
    if (!$curr_in_stock && $in_stock) {
        changeStockFromOrder($shop_order->getId(), 1);
    }
});
