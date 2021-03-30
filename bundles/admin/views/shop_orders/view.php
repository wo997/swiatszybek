<?php //route[{ADMIN}/zamowienia] 
?>

<?php startSection("head_content"); ?>

<title>Zamówienia</title>

<script>
    <?= preloadOrderStatuses() ?>
    <?= preloadDeliveryTypes() ?>
</script>

<?php startSection("body_content"); ?>

<datatable-comp class="shop_orders"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>