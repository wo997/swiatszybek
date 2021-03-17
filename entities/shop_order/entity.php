<?php //hook[entity]

EntityManager::register("shop_order", [
    "props" => [
        "reference" => ["type" => "string"],
        "status_id" => ["type" => "number"],
        //"user_id" => ["type" => "number"],
        "main_address" => ["type" => "address"],
        "courier_address" => ["type" => "address"],
        "parcel_locker" => ["type" => "parcel_locker"],
        "products_price" => ["type" => "number"],
        "delivery_price" => ["type" => "number"],
        "total_price" => ["type" => "number"],
        "delivery_id" => ["type" => "number"],
        "rebate_codes" => ["type" => "string"],
        "ordered_products" => ["type" => "ordered_product[]"],
    ],
]);

EntityManager::oneToMany("shop_order", "ordered_products", "ordered_product", ["parent_required" => true]);

EntityManager::register("user", [
    "props" => [
        "shop_orders" => ["type" => "shop_order[]"]
    ],
]);

//EntityManager::oneToMany("user", "shop_orders", "shop_order");

EntityManager::oneToOne("shop_order", "main_address", "address");

EntityManager::oneToOne("shop_order", "courier_address", "address");

EntityManager::oneToOne("shop_order", "parcel_locker", "parcel_locker");

EventListener::register("before_save_shop_order_entity", function ($params) {
    /** @var Entity ShopOrder */
    $shop_order = $params["obj"];

    if ($shop_order->is_new) {
        $tries = 0;
        do {
            $reference = Security::generateToken(15);
            $tries++;
        } while (DB::fetchVal("SELECT 1 FROM shop_order WHERE reference = ?", [$reference]) || $tries > 5);

        $shop_order->setProp("reference", $reference);

        $user_cart = User::getCurrent()->cart;
        $cart_data = $user_cart->getAllData();

        $shop_order->setProp("products_price", $cart_data["products_price"]);
        $shop_order->setProp("delivery_price", $cart_data["delivery_price"]);
        $shop_order->setProp("delivery_id", $cart_data["delivery_price"]);
        $shop_order->setProp("total_price", $cart_data["total_price"]);
        $shop_order->setProp("rebate_codes", $cart_data["rebate_codes"]);

        $shop_order->setProp("delivery_id", $user_cart->getDeliveryId());

        // $ordered_products = [];
        // foreach ($cart_data["products"] as $product_data) {
        //     $product_data["shop_order_id"] = $shop_order->getId();
        //     $ordered_product = EntityManager::getEntity("ordered_product", $product_data);
        //     $ordered_products[] = $ordered_product;
        // }
        // $shop_order->setProp("ordered_products", $ordered_products);
        $shop_order->setProp("ordered_products", $cart_data["products"]); // ezy

        $shop_order->setProp("status_id", 1);

        $shop_order->setProp("user", User::getCurrent()->getId());

        $user_cart->empty();
        $user_cart->save();
    }
});
