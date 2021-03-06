<?php //route[/zamowienie]

$shop_order_id = Request::urlParam(1);
$shop_order = EntityManager::getEntityById("shop_order", $shop_order_id);
$reference = Request::urlParam(2);
if (!$shop_order || $shop_order->getProp("reference") !== $reference) {
    Request::setSingleUsageSessionVar("message_modal", json_encode(["type" => "error", "body" => "Niepoprawny link do zamówienia"]));
    Request::redirect("/");
}

$pay_url = "/payment/przelewy24/shop_order/pay/$shop_order_id";

$force_payment = Request::getSingleUsageSessionVar("force_payment");
if ($force_payment) {
    Request::redirect($pay_url);
}

?>

<?php Templates::startSection("head"); ?>

<title>Zamówienie #<?= $shop_order->getId() ?></title>

<?php Templates::startSection("body_content"); ?>

<?php

/** @var Entity Address */
$main_address = $shop_order->getProp("main_address");

/** @var Entity Address */
$courier_address = $shop_order->getProp("courier_address");

/** @var Entity ParcelLocker */
$parcel_locker = $shop_order->getProp("parcel_locker");

/** @var Entity[] OrderedProduct */
$ordered_products = $shop_order->getProp("ordered_products");

/** @var Entity OrderStatus */
$order_status = $shop_order->getProp("status");

$requires_payment = $shop_order->getProp("status")->getId() === 1;

/** @var Entity Carrier */
$carrier = $shop_order->getProp("carrier");

/** @var Entity DeliveryType */
$delivery_type = $carrier ? $carrier->getProp("delivery_type") : null;
$delivery_type_id = $delivery_type ? $delivery_type->getProp("delivery_type_id") : null;

$payment_time = $shop_order->getProp("payment_time");
$payment_time_label = getShopOrderPaymentTimeLabel($payment_time);
?>

<div class="order_all">
    <h1 class="h1 center">Zamówienie #<?= $shop_order->getId() ?></h1>

    <div class="order_container">
        <div class="order_details">
            <div class="label big mt0">Status zamówienia</div>
            <div class="status_rect" style="color:<?= $order_status->getProp("font_clr") ?>;background:<?= $order_status->getProp("bckg_clr") ?>"><?= $order_status->getProp("name") ?></div>

            <?php if ($requires_payment) : ?>
                <!-- <div class="label medium">Wybierz metodę płatności</div>
                <div class="radio_group payment_method">
                    <div class="checkbox_area">
                        <p-checkbox data-value="przelewy24"></p-checkbox>
                        <span>
                            <img src="/src/img/przelewy24-vector-logo.svg" style="width:100px;vertical-align: middle;">
                        </span>
                    </div>
                    <div class="checkbox_area">
                        <p-checkbox data-value="random"></p-checkbox>
                        <span>
                            <img src="/src/img/target_icon.svg" style="width:50px;vertical-align: middle;">
                        </span>
                    </div>
                </div> -->

                <div class="label big">Opłać zamówienie (<?= $shop_order->getProp("total_price"); ?> zł)</div>
                <img src="/src/img/przelewy24-vector-logo.svg" style="width: 130px;margin: 10px 0;">
                <a class="btn fill medium pay_btn" href="<?= $pay_url ?>">Płacę</a>
            <?php endif ?>


            <div class="label big">Dane kontaktowe</div>

            <?php if ($main_address->getProp("party") === "company") : ?>
                <div class="label">Firma</div>
                <div><?= $main_address->getProp("__display_name") ?></div>

                <div class="label">NIP</div>
                <div><?= $main_address->getProp("nip") ?></div>
            <?php else : ?>
                <div class="label">Imię i nazwisko</div>
                <div><?= $main_address->getProp("__display_name") ?></div>
            <?php endif ?>

            <div class="label">Email</div>
            <div><?= $main_address->getProp("email") ?></div>

            <div class="label">Nr telefonu</div>
            <div><?= $main_address->getProp("phone") ?></div>

            <div class="label">Adres</div>
            <div><?= $main_address->getProp("__address_line_1") ?></div>
            <div><?= $main_address->getProp("__address_line_2") ?></div>

            <?php if ($delivery_type_id === 1) : ?>
                <div class="label big bold">Dostawa</div>
                <div class="semi_bold">Kurier <?= $carrier->getProp("name") ?> <?= $payment_time_label ?></div>
                <?php if ($courier_address) : ?>
                    <div><?= $courier_address->getProp("__address_line_1") ?></div>
                    <div><?= $courier_address->getProp("__address_line_2") ?></div>
                    <a target="_blank" class="link" href="http://maps.google.com/maps?q=<?= urlencode($courier_address->getProp("street") . " " . $courier_address->getProp("building_number") . " " . $courier_address->getProp("city")) ?>">
                        Pokaż na mapie <i class="fas fa-map-marker-alt"></i>
                    </a>
                <?php endif ?>
            <?php endif ?>

            <?php if ($delivery_type_id === 2) : ?>
                <div class="label big bold">Dostawa</div>
                <div class="semi_bold">Paczkomat <?= $carrier->getProp("name") ?></div>
                <?php if ($parcel_locker) : ?>
                    <div> <?= $parcel_locker->getProp("name") ?></div>
                    <div><?= $parcel_locker->getProp("__address_line_1") ?></div>
                    <div><?= $parcel_locker->getProp("__address_line_2") ?></div>
                    <a target="_blank" class="link" href="http://maps.google.com/maps?q=<?= urlencode("Paczkomat " . $parcel_locker->getProp("name")) ?>">
                        Pokaż na mapie <i class="fas fa-map-marker-alt"></i>
                    </a>
                <?php endif ?>
            <?php endif ?>

            <?php if ($delivery_type_id === 3) : ?>
                <div class="label big bold">Odbiór osobisty</div>
                <div class="semi_bold"><?= $carrier->getProp("name") ?></div>
                <a target="_blank" class="link" href="<?= $carrier->getProp("google_maps_share_link") ?>">
                    Pokaż na mapie <i class="fas fa-map-marker-alt"></i>
                </a>
            <?php endif ?>

        </div>

        <div class="order_products">
            <div class="label big mt0">Produkty</div>

            <ul>
                <?php
                foreach ($ordered_products as $ordered_product) {
                    $name =  $ordered_product->getProp("name");
                    $url = $ordered_product->getProp("url");
                    $img_url = $ordered_product->getProp("img_url");
                    $qty = $ordered_product->getProp("qty");
                    $gross_price = $ordered_product->getProp("gross_price");
                    $total_price = roundPrice($qty * $gross_price);

                    echo "<div class=\"product_row\">";
                    echo "<img src=\"$img_url\">";
                    echo "<a class=\"product_name\" href=\"$url\"> $name </a>";
                    echo "<p class=\"product_qty_price\">";
                    if ($qty > 1) {
                        echo "<span class=\"base_price\">$gross_price zł</span> × $qty = $total_price zł";
                    } else {
                        echo "$gross_price zł";
                    }
                    echo "</p>";
                    echo "</div>";
                }
                ?>
            </ul>

            <div style="text-align:right" class="mt2">
                <div class="semi_bold">Produkty: <span class="pln"><?= $shop_order->getProp("products_price") ?> zł</span></div>
                <div class="semi_bold">Dostawa: <span class="pln"><?= $shop_order->getProp("delivery_price"); ?> zł</span></div>
                <?php
                $rebate_codes = json_decode($shop_order->getProp("rebate_codes_json"), true);
                if ($rebate_codes) {
                    foreach ($rebate_codes as $rebate_code) {
                        $code = $rebate_code["code"];
                        $value = $rebate_code["value"];
                ?>
                        <span class="rebate_code_block">
                            <span><span class="normal"> <?= $code ?>:</span> -<?= $value . (strpos($value, "%") !== false ? "" : " zł") ?></span>
                        </span>
                <?php
                    }
                }
                ?>

                <div class="semi_bold medium">Suma: <span class="pln"><?= $shop_order->getProp("total_price") ?> zł</span></div>
            </div>
        </div>
    </div>

    <div style="height: 70px"></div>
</div>

<?php include "bundles/global/templates/default.php"; ?>