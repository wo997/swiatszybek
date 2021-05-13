<?php //route[{USER}/zamowienia]
?>

<?php startSection("head_content"); ?>

<script>
    <?= preloadOrderStatuses() ?>
</script>

<title>Moje zamówienia</title>

<?php startSection("user_page_body"); ?>

<datatable-comp class="shop_orders"></datatable-comp>

<div style="height:70px"></div>

<?php include "bundles/user/templates/default.php"; ?>