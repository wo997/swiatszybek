<?php //route[{ADMIN}cechy-produktow]

?>

<?php startSection("head_content"); ?>

<title>Cechy produktów</title>

<script>
    <?= preloadProductFeatures() ?>
</script>

<?php startSection("body_content"); ?>

<datatable-comp class="product_features"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>