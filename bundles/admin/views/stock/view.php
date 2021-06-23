<?php //route[{ADMIN}/magazyn] 
?>

<?php Templates::startSection("head_content"); ?>

<title>Magazyn</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="stock_products"></datatable-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadProducts() ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>