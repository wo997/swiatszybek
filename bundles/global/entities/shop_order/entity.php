<?php //hook[entity]

EntityManager::register("shop_order", [
    "props" => [
        "reference" => ["type" => "string"],
        "__url" => ["type" => "string"],
        "status" => ["type" => "order_status"],
        "delivery_type" => ["type" => "delivery_type"],
        "carrier" => ["type" => "carrier"],
        "package_api_key" => ["type" => "string"],
        "payment_time" => ["type" => "string"],
        "user_id" => ["type" => "number"],
        "main_address" => ["type" => "address"],
        "courier_address" => ["type" => "address"],
        "parcel_locker" => ["type" => "parcel_locker"],
        "products_price" => ["type" => "number"],
        "delivery_price" => ["type" => "number"],
        "total_price" => ["type" => "number"],
        "rebate_codes_json" => ["type" => "string"],
        "ordered_products" => ["type" => "ordered_product[]"],
        "ordered_at" => ["type" => "string"],
        "paid_at" => ["type" => "string"],
        "client_notes" => ["type" => "string"],
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

EntityManager::oneToOne("shop_order", "carrier", "carrier");

EntityManager::oneToOne("shop_order", "delivery_type", "delivery_type");

EventListener::register("before_save_shop_order_entity", function ($params) {
    /** @var Entity ShopOrder */
    $shop_order = $params["obj"];
    $shop_order->setProp("__url", getShopOrderLink($shop_order->getProp("shop_order_id"), $shop_order->getProp("reference")));
});

// change stock on status change
EventListener::register("set_shop_order_entity_status", function ($params) {
    /** @var Entity ShopOrder */
    $shop_order = $params["obj"];

    /** @var Entity OrderStatus */
    $status = $params["val"];
    $status_id = $status ? $status->getId() : 0;

    /** @var Entity OrderStatus */
    $curr_status = $shop_order->getCurrProp("status");
    $curr_status_id = $curr_status ? $curr_status->getId() : 0;

    if ($status_id === $curr_status_id) {
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
});

// send email to the customer on status change
EventListener::register("after_save_shop_order_entity", function ($params) {
    /** @var Entity ShopOrder */
    $shop_order = $params["obj"];

    $curr_status = $shop_order->getCurrProp("status");
    $curr_status_id = $curr_status ? $curr_status->getId() : 0;

    /** @var Entity OrderStatus */
    $status = $shop_order->getProp("status");
    $status_id = $status ? $status->getId() : 0;

    /** @var Entity Carrier */
    $carrier = $shop_order->getProp("carrier");

    /** @var Entity DeliveryType */
    $delivery_type = $carrier ? $carrier->getProp("delivery_type") : null;
    $delivery_type_id = $delivery_type ? $delivery_type->getProp("delivery_type_id") : null;

    $payment_time = $shop_order->getProp("payment_time");
    $payment_time_label = getShopOrderPaymentTimeLabel($payment_time);

    /** @var Entity Address */
    $courier_address = $shop_order->getProp("courier_address");

    /** @var Entity ParcelLocker */
    $parcel_locker = $shop_order->getProp("parcel_locker");

    if ($status_id === $curr_status_id) {
        return;
    }

    $shop_order_id = $shop_order->getId();

    /** @var Entity Address */
    $main_address = $shop_order->getProp("main_address");
    if (!$main_address) {
        return;
    }

    $email_title = "";
    $email_body = "";

    $get_shop_order_link = function ($label) use ($shop_order) {
        return "<a href=\"" . SITE_URL . $shop_order->getProp("__url") . "\" style=\"{link}\">$label</a>";
    };

    //var_dump(getSetting(["theme", "general", "colors", "primary"])); // primary etc, u can take it from here

    if ($status_id === 1) {
        $email_title .= "Potwierdzenie zamówienia #$shop_order_id";

        $email_body .= "<div>Cieszymy się, że zrobiłaś/eś zakupy w naszym sklepie!<br>Poniżej szczegóły " . $get_shop_order_link("zamówienia #" . $shop_order->getId()) . ":</div>\n";

        if ($main_address->getProp("party") === "company") {
            $email_body .= "<div style=\"{label}\">Firma</div>\n";
            $email_body .= "<div>" . $main_address->getProp("__display_name") . "</div>\n";

            $email_body .= "<div style=\"{label}\">NIP</div>\n";
            $email_body .= "<div>" . $main_address->getProp("nip") . "</div>\n";
        } else {
            $email_body .= "<div style=\"{label}\">Imię i nazwisko</div>\n";
            $email_body .= "<div>" . $main_address->getProp("__display_name") . "</div>\n";
        }

        $email_body .= "<div style=\"{label}\">Email</div>\n";
        $email_body .= "<div>" . $main_address->getProp("email") . "</div>\n";

        $email_body .= "<div style=\"{label}\">Nr telefonu</div>\n";
        $email_body .= "<div>" . $main_address->getProp("phone") . "</div>\n";

        $email_body .= "<div style=\"{label}\">Adres</div>\n";
        $email_body .= "<div>" . $main_address->getProp("__address_line_1") . "</div>\n";
        $email_body .= "<div>" . $main_address->getProp("__address_line_2") . "</div>\n";

        if ($delivery_type_id === 1) {
            $email_body .= "<div style=\"{label}\">Dostawa</div>\n";
            $email_body .= "<div>Kurier " . $carrier->getProp("name") . " " . $payment_time_label . "</div>\n";
            if ($courier_address) {
                $email_body .= "<div>" . $courier_address->getProp("__address_line_1") . "</div>\n";
                $email_body .= "<div>" . $courier_address->getProp("__address_line_2") . "</div>\n";
                $email_body .= "<a href=\"http://maps.google.com/maps?q=" . urlencode($courier_address->getProp("street") . " " . $courier_address->getProp("building_number") . " " . $courier_address->getProp("city")) . "\">Pokaż na mapie</a>\n";
            }
        }

        if ($delivery_type_id === 2) {
            $email_body .= "<div style=\"{label}\">Dostawa</div>\n";
            $email_body .= "<div>Paczkomat " . $carrier->getProp("name") . "</div>\n";
            if ($parcel_locker) {
                $email_body .= "<div>" . $parcel_locker->getProp("name") . "</div>\n";
                $email_body .= "<div>" . $parcel_locker->getProp("__address_line_1") . "</div>\n";
                $email_body .= "<div>" . $parcel_locker->getProp("__address_line_2") . "</div>\n";
                $email_body .= "<a href=\"http://maps.google.com/maps?q=" . urlencode("Paczkomat " . $parcel_locker->getProp("name")) . "\">Pokaż na mapie</a>\n";
            }
        }

        if ($delivery_type_id === 3) {
            $email_body .= "<div style=\"{label}\">Odbiór osobisty</div>\n";
            $email_body .= "<div>" . $carrier->getProp("name") . "</div>\n";
            $email_body .= "<a href=\"" . $carrier->getProp("google_maps_share_link") . "\">Pokaż na mapie</a>\n";
        }

        /** @var Entity[] OrderedProduct */
        $ordered_products = $shop_order->getProp("ordered_products");

        $ordered_products_html = "<table style=\"margin: 10px 0;\">\n";
        foreach ($ordered_products as $ordered_product) {
            $name =  $ordered_product->getProp("name");
            $url = SITE_URL . $ordered_product->getProp("url");
            $img_url = SITE_URL . $ordered_product->getProp("img_url");
            $qty = $ordered_product->getProp("qty");
            $gross_price = $ordered_product->getProp("gross_price");
            $total_price = roundPrice($qty * $gross_price);

            $ordered_products_html .= "<tr>\n";

            $ordered_products_html .= "<td> <img src=\"$img_url\" width=\"70\" height=\"70\" alt=\"$name\" title=\"$name\" style=\"display:block;margin-right:5px;object-fit:contain;\"> </td>\n";
            $ordered_products_html .= "<td> <a style=\"font-weight: 600;\" href=\"$url\">$name</a> <div style=\"margin-top:5px\"> $gross_price zł × $qty = $total_price zł</div> </td>\n";

            $ordered_products_html .= "</tr>\n";
        }
        $ordered_products_html .= "</table>\n";

        $email_body .= "<div style=\"{label}\">Produkty</div>\n";
        $email_body .= $ordered_products_html;

        $email_body .= "<br><div>Jeśli nie opłaciłaś/eś jeszcze zamówienia możesz to zrobić korzystając z " . $get_shop_order_link("tego linku") . ".</div>\n";
    }
    if ($status_id === 2) {
        $email_title .= "Opłacono zamówienie #$shop_order_id";

        $email_body .= "<div>Odnotowaliśmy wpłatę za " . $get_shop_order_link("zamówienie #" . $shop_order->getId()) . "</div>\n";
        $email_body .= "<div>Wkrótce przygotujemy zamówienie do wysyłki.</div>\n";
    }
    if ($status_id === 3) {
        $email_title .= "Wysłano zamówienie #$shop_order_id";

        $email_body .= "<div>Chcieliśmy poinformować Cię, że " . $get_shop_order_link("zamówienie #" . $shop_order->getId()) . " zostało spakowane oraz przekazane kurierowi.</div>\n";
        $email_body .= "<div>Możesz śledzić status przesyłki korzystając z <a href=\"" . SITE_URL . "\" style=\"{link}\">tego linku</a>.</div>\n";
    }
    if ($status_id === 4) {
        $email_title .= "Odebrano zamówienie #$shop_order_id";

        $email_body .= "<div>Właśnie odebrałaś/eś " . $get_shop_order_link("zamówienie #" . $shop_order->getId()) . " z naszego sklepu.</div>\n";
        $email_body .= "<div>Dziękujemy i zapraszamy na <a href=\"" . SITE_URL . "\" style=\"{link}\">kolejne zakupy</a>.</div>\n";
    }
    if ($status_id === 5) {
        $email_title .= "Anulowano zamówienie #$shop_order_id";

        $email_body .= "<div>Anulowaliśmy " . $get_shop_order_link("zamówienie #" . $shop_order->getId()) . "</div>\n";
        $email_body .= "<div>Zapraszamy na <a href=\"" . SITE_URL . "\" style=\"{link}\">kolejne zakupy</a>.</div>\n";
    }
    if ($status_id === 6) {
        $email_title .= "Zwrócono zamówienie #$shop_order_id";

        $email_body .= "<div>Otrzymaliśmy zwrot produktów z " . $get_shop_order_link("zamówienia #" . $shop_order->getId()) . ":</div>\n";
        // TODO: print products u want to return
        $email_body .= "<div>Pieniądze zostaną zwrócone w ten sam sposób w jaki dokonano płatności.</div>\n";
        $email_body .= "<div>Zapraszamy na <a href=\"" . SITE_URL . "\" style=\"{link}\">kolejne zakupy</a>.</div>\n";
    }

    if ($email_body && $email_title) {
        $company_data = getSetting(["general", "company"], "");
        $emails = [$main_address->getProp("email"), $company_data["main_email"]];

        foreach ($emails as $email) {
            sendDefaultEmail($email, $email_body, $email_title, $main_address->getProp("__display_name"));
        }
    }

    if ($status_id === 6) {
        // hey this should be added in przelewy24 module?
        // TODO: just do it
        Przelewy24::get()->refund($shop_order_id);
    }
});
