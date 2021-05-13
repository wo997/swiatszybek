<?php //route[{ADMIN}/cechy-produktow]

?>

<?php startSection("head_content"); ?>

<title>Cechy produktów</title>

<script>
    <?= preloadProductFeatures() ?>
</script>

<?php startSection("admin_page_body"); ?>

<datatable-comp class="product_features"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>