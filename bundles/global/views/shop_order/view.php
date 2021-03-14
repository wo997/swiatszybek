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

<?= json_encode($shop_order->getAllProps(), JSON_PRETTY_PRINT) ?>

<?php include "bundles/global/templates/default.php"; ?>