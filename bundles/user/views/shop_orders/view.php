<?php //route[{USER}/zamowienia]
?>

<?php Templates::startSection("head_content"); ?>

<title>Moje zamówienia</title>

<?php Templates::startSection("user_page_body"); ?>

<datatable-comp class="shop_orders"></datatable-comp>

<div style="height:70px"></div>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadOrderStatuses() ?>
</script>

<?php include "bundles/user/templates/default.php"; ?>