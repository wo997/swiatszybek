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
    //var_dump(getSetting(["theme", "general", "colors"])); // primary etc, u can take it from here

    /** @var Entity ShopOrder */
    $shop_order = $params["obj"];
    $shop_order_id = $shop_order->getId();

    /** @var Entity Address */
    $main_address = $shop_order->getProp("main_address");
    if (!$main_address) {
        return;
    }

    $status_id = $params["val"];

    $curr_status_id = $shop_order->getCurrProp("status_id");

    $status_changes = $status_id !== $curr_status_id;

    if (!$status_changes) {
        return;
    }

    $curr_in_stock = isOrderStatusInStock($curr_status_id);
    $in_stock = isOrderStatusInStock($status_id);

    if ($curr_in_stock && !$in_stock) {
        changeStockFromOrder($shop_order->getId(), -1);
    }
    if (!$curr_in_stock && $in_stock) {
        changeStockFromOrder($shop_order->getId(), 1);
    }

    $email_title = "";
    $email_body = "";

    //if ($curr_status_id === 0 && $status_id === 1) {
    if ($status_id === 1) {
        $email_title .= "Przyjęliśmy zamówienie #$shop_order_id - LSIT";

        $email_body .= "<div style=\"font-size:15px\">";

        $email_body .= "<div style=\"font-size:1.2em;font-weight: 600;\">Witaj " . $main_address->getProp("__display_name") . "!</div>";
        $email_body .= "<br>";

        $email_body .= "<div>Cieszymy się, że zrobiłaś/eś zakupy w naszym sklepie!<br>Oto szczegóły Twojego zamówienia:</div>";

        $email_body .= "<h2 style=\"font-size:1.2em;margin: 0.85em 0;\">Dane kontaktowe</h2>";

        if ($main_address->getProp("party") === "company") {
            $email_body .= "<h2 style=\"font-size:1.2em;margin: 0.85em 0;\">Firma</h2>";

            $email_body .= "<div style=\"margin-top: 15px;font-weight: 600;\">Firma</div>";
            $email_body .= "<div>" . $main_address->getProp("__display_name") . "</div>";

            $email_body .= "<div style=\"margin-top: 15px;font-weight: 600;\">NIP</div>";
            $email_body .= "<div>" . $main_address->getProp("nip") . "</div>";
        } else {
            $email_body .= "<div style=\"margin-top: 15px;font-weight: 600;\">Imię i nazwisko</div>";
            $email_body .= "<div>" . $main_address->getProp("__display_name") . "</div>";
        }

        $email_body .= "<div style=\"margin-top: 15px;font-weight: 600;\">Email</div>";
        $email_body .= "<div>" . $main_address->getProp("email") . "</div>";

        $email_body .= "<div style=\"margin-top: 15px;font-weight: 600;\">Nr telefonu</div>";
        $email_body .= "<div>" . $main_address->getProp("phone") . "</div>";

        $email_body .= "<div style=\"margin-top: 15px;font-weight: 600;\">Adres</div>";
        $email_body .= "<div>" . $main_address->getProp("__address_line_1") . "</div>";
        $email_body .= "<div>" . $main_address->getProp("__address_line_2") . "</div>";

        /** @var Entity[] OrderedProduct */
        $ordered_products = $shop_order->getProp("ordered_products");

        $ordered_products_html = "<table style=\"margin: 10px 0;\">";
        foreach ($ordered_products as $ordered_product) {
            $name =  $ordered_product->getProp("name");
            $url = SITE_URL . $ordered_product->getProp("url");
            $img_url = SITE_URL . $ordered_product->getProp("img_url");
            $qty = $ordered_product->getProp("qty");
            $gross_price = $ordered_product->getProp("gross_price");
            $total_price = roundPrice($qty * $gross_price);

            $ordered_products_html .= "<tr>";

            $ordered_products_html .= "<td> <img src=\"$img_url\" width=\"70\" height=\"70\" alt=\"$name\" title=\"$name\" style=\"display:block;margin-right:5px\"> </td>";
            $ordered_products_html .= "<td> <a style=\"font-weight: 600;\" href=\"$url\">$name</a> <div style=\"margin-top:5px\"> $gross_price zł × $qty = $total_price zł</div> </td>";

            $ordered_products_html .= "</tr>";
        }
        $ordered_products_html .= "</table>";


        $email_body .= "<h2 style=\"font-size:1.2em;margin: 0.85em 0;\">Produkty</h2>";
        $email_body .= $ordered_products_html;

        $email_body .= "</div>";
    }

    sendEmail($main_address->getProp("email"), $email_body, $email_title);
});
