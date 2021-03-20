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

?>

<div class="order_all">
    <div class="label big center">Zamówienie #<?= $shop_order->getId() ?></div>

    <div class="order_container">
        <div class="order_details">
            <div class="label medium">Klient</div>
            <div><?= $main_address->getProp("__display_name") ?></div>

            <div class="label medium">Adres</div>
            <div><?= $main_address->getProp("__address_line_1") ?></div>
            <div><?= $main_address->getProp("__address_line_2") ?></div>

            <?php if ($courier_address) : ?>
                <div class="label medium">Adres dostawy</div>
                <div><?= $courier_address->getProp("__address_line_1") ?></div>
                <div><?= $courier_address->getProp("__address_line_2") ?></div>
            <?php endif ?>

            <?php if ($parcel_locker) : ?>
                <div class="label medium">Adres dostawy</div>
                <div><?= $parcel_locker->getProp("name") ?></div>
                <div><?= $parcel_locker->getProp("__address_line_1") ?></div>
                <div><?= $parcel_locker->getProp("__address_line_2") ?></div>
            <?php endif ?>
        </div>

        <div class="order_products">
            <div class="label medium">Produkty</div>

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
</div>

<?php include "bundles/global/templates/default.php"; ?>