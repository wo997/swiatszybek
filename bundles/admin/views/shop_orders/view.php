<?php //route[{ADMIN}/zamowienia] 
?>

<?php Templates::startSection("head_content"); ?>

<title>Zamówienia</title>

<script>
    <?= preloadOrderStatuses() ?>
    <?= preloadDeliveryTypes() ?>
    <?= preloadCarriers() ?>
</script>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="shop_orders"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>