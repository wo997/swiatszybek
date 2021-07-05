<?php //route[{ADMIN}/wydatki] 
?>

<?php Templates::startSection("head"); ?>

<title>Wydatki</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="expenses"></datatable-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadProducts() ?>
    <?= preloadVats() ?>
    <?= preloadUECountries() ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>