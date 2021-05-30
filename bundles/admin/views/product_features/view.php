<?php //route[{ADMIN}/cechy-produktow]

?>

<?php Templates::startSection("head_content"); ?>

<title>Cechy produktów</title>

<script>
    <?= preloadProductFeatures() ?>
</script>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="product_features"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>