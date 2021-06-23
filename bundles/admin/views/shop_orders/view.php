<?php //route[{ADMIN}/zamowienia] 
?>

<?php Templates::startSection("head"); ?>

<title>Zamówienia</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="shop_orders"></datatable-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadOrderStatuses() ?>
    <?= preloadDeliveryTypes() ?>
    <?= preloadCarriers() ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>