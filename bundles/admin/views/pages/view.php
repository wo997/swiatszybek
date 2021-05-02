<?php //route[{ADMIN}/strony]

?>

<?php startSection("head_content"); ?>

<title>Strony</title>

<script>
    <?= preloadProductCategories() ?>
    <?= preloadGeneralProducts() ?>
</script>

<?php startSection("body_content"); ?>

<datatable-comp class="pages"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>