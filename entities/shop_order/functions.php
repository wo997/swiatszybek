<?php //hook[helper]

/**
 * getShopOrderLink
 *
 * @param  number $general_product_id
 * @param  number[] $option_ids
 * @param  string $name
 * @param  string[] $options_names
 * @return string
 */
function getShopOrderLink($shop_order_id, $reference)
{
    $link = "/zamowienie";
    $link .= "/" . $shop_order_id;
    $link .= "/" . $reference;
    return $link;
}


/**
 * changeStockFromOrder
 * direction (1: add to stock, 2: remove from stock)
 *
 * @param  mixed $shop_order_id
 * @param  number $direction
 * @return void
 */
function changeStockFromOrder($shop_order_id, $direction)
{
    if ($direction !== -1 && $direction !== 1) {
        return;
    }

    $shop_order = EntityManager::getEntityById("shop_order", $shop_order_id);

    /** @var Entity[] OrderedProduct */
    $ordered_products = $shop_order->getProp("ordered_products");

    foreach ($ordered_products as $ordered_product) {
        $product_id = $ordered_product->getProp("product_id");
        $product = EntityManager::getEntityById("product", $product_id);
        if (!$product) {
            continue;
        }
        $qty = $ordered_product->getProp("qty");
        $product->setProp("stock", $product->getProp("stock") + $direction * $qty);
    }
}

/**
 * isOrderStatusInStock
 *
 * @param  int $order_status_id
 * @return void
 */
function isOrderStatusInStock($order_status_id)
{
    return in_array($order_status_id, [0, 5, 6]);
}

function confirmOrder($shop_order_data)
{
    $shop_order = EntityManager::getEntity("shop_order", $shop_order_data);
    if (!$shop_order->is_new) {
        // someone trying to do nasty things
        Request::jsonResponse(["success" => false]);
    }

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
    $shop_order->setProp("total_price", $cart_data["total_price"]);
    $shop_order->setProp("rebate_codes", $cart_data["rebate_codes"]);

    $shop_order->setProp("delivery_type", $user_cart->getDeliveryTypeId());

    $shop_order->setProp("ordered_products", $cart_data["products"]); // THESE FIELDS MUST BE THE SAME, cause in the future you will reuse the basket to calculate the order price

    $shop_order->setProp("user_id", User::getCurrent()->getId());

    // you can do it once everything is ready
    $shop_order->setProp("status", 1);

    return $shop_order;
}
