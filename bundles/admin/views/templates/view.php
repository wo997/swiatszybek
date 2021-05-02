<?php //route[{ADMIN}/szablony]

?>

<?php startSection("head_content"); ?>

<title>Szablony</title>

<script>
    <?= preloadProductCategories() ?>
    <?= preloadGeneralProducts() ?>
</script>

<?php startSection("body_content"); ?>

<datatable-comp class="templates"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>