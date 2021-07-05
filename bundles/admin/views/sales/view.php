<?php //route[{ADMIN}/sprzedaz] 
?>

<?php Templates::startSection("head"); ?>

<title>Sprzedaż</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="sales"></datatable-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadProducts() ?>
    <?= preloadVats() ?>
    <?= preloadUECountries() ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>