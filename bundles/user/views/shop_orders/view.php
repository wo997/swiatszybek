<?php //route[{USER}/zamowienia]
?>

<?php startSection("head_content"); ?>

<script>
    <?= preloadOrderStatuses() ?>
</script>

<title>Moje zamówienia</title>

<?php startSection("body_content"); ?>

<datatable-comp class="shop_orders"></datatable-comp>

<?php include "bundles/user/templates/default.php"; ?>