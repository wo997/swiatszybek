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

Reference: <?= $shop_order->getProp("reference") ?>

<br>

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

foreach ($ordered_products as $ordered_product) {
    $name =  $ordered_product->getProp("name");
    $url = $ordered_product->getProp("url");
    $img_url = $ordered_product->getProp("img_url");
    $qty = $ordered_product->getProp("qty");
    $gross_price = $ordered_product->getProp("gross_price");

    echo "<a href=\"$url\"><img style=\"width:100px\" src=\"$img_url\"> $name | $qty | $gross_price zł</a>";
}

?>


<div class="label">Klient</div>
<div><?= $main_address->getProp("__display_name") ?></div>

<div class="label">Adres</div>
<div><?= $main_address->getProp("__address_line_1") ?></div>
<div><?= $main_address->getProp("__address_line_2") ?></div>

<?php if ($courier_address) : ?>
    <div class="label">Adres dostawy</div>
    <div><?= $courier_address->getProp("__address_line_1") ?></div>
    <div><?= $courier_address->getProp("__address_line_2") ?></div>
<?php endif ?>

<?php if ($parcel_locker) : ?>
    <div class="label">Adres dostawy</div>
    <div><?= $parcel_locker->getProp("name") ?></div>
    <div><?= $parcel_locker->getProp("__address_line_1") ?></div>
    <div><?= $parcel_locker->getProp("__address_line_2") ?></div>
<?php endif ?>

<?php include "bundles/global/templates/default.php"; ?>