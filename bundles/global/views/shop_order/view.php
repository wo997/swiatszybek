<?php //route[/zamowienie]

$shop_order_id = Request::urlParam(1);
$shop_order = EntityManager::getEntityById("shop_order", $shop_order_id);
$reference = Request::urlParam(2);
if (!$shop_order || $shop_order->getProp("reference") !== $reference) {
    Request::setSingleUsageSessionVar("message_modal", json_encode(["type" => "error", "body" => "Niepoprawny link do zamówienia"]));
    Request::redirect("/");
}

?>

<?php startSection("head_content"); ?>

<title>Zamówienie #<?= $shop_order->getId() ?></title>

<?php startSection("body_content"); ?>

<?php
// $user = $shop_order->getParent("user");
// if ($user) {
//     echo json_encode($user->getSimpleProps(), JSON_PRETTY_PRINT) . "<br><br>";
// }

?>


<?php
//$shop_order_data = $shop_order->getAllProps() ;
//$shop_order_data["courier"]

/** @var Entity Address */
$main_address = $shop_order->getProp("main_address");

/** @var Entity Address */
$courier_address = $shop_order->getProp("courier_address");

/** @var Entity ParcelLocker */
$parcel_locker = $shop_order->getProp("parcel_locker");

/** @var Entity[] OrderedProduct */
$ordered_products = $shop_order->getProp("ordered_products");

$requires_payment = $shop_order->getProp("status_id") === 1;
?>

<div class="order_all">
    <h1 class="h1 center">Zamówienie #<?= $shop_order->getId() ?></h1>

    <div class="order_container">
        <div class="order_details">
            <div class="label big first">Status zamówienia</div>
            <div class="status_rect requires_payment">Oczekuje na opłatę</div>

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
                <a class="btn fill medium pay_btn" href="/przelewy24/pay">Płacę</a>
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

            <?php if ($courier_address) : ?>
                <div class="label big bold">Dostawa (kurier)</div>
                <div><?= $courier_address->getProp("__address_line_1") ?></div>
                <div><?= $courier_address->getProp("__address_line_2") ?></div>
                <a target="_blank" class="link" href="http://maps.google.com/maps?q=<?= urlencode($courier_address->getProp("street") . " " . $courier_address->getProp("building_number") . " " . $courier_address->getProp("city")) ?>">
                    Pokaż na mapie <i class="fas fa-map-marker-alt"></i>
                </a>
            <?php endif ?>

            <?php if ($parcel_locker) : ?>
                <div class="label big bold">Dostawa (paczkomat)</div>
                <div> <?= $parcel_locker->getProp("name") ?></div>
                <div><?= $parcel_locker->getProp("__address_line_1") ?></div>
                <div><?= $parcel_locker->getProp("__address_line_2") ?></div>
                <a target="_blank" class="link" href="http://maps.google.com/maps?q=<?= urlencode("Paczkomat " . $parcel_locker->getProp("name")) ?>">
                    Pokaż na mapie <i class="fas fa-map-marker-alt"></i>
                </a>
            <?php endif ?>
        </div>

        <div class="order_products">
            <div class="label big first">Produkty</div>

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
                    if ($qty > 1) {
                        echo "<p class=\"product_qty_price\"> <span class=\"base_price\">$gross_price zł</span> × $qty = $total_price zł</p>";
                    } else {
                        echo "<p class=\"product_qty_price\">$gross_price zł</p>";
                    }
                    echo "</div>";
                }
                ?>
            </ul>
        </div>
    </div>

    <div style="height: 70px"></div>
</div>

<?php include "bundles/global/templates/default.php"; ?>