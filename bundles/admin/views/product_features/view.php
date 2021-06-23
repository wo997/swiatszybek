<?php //route[{ADMIN}/cechy-produktow]

?>

<?php Templates::startSection("head"); ?>

<title>Cechy produktów</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="product_features"></datatable-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadProductFeatures() ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>