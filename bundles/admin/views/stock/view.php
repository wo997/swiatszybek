<?php //route[{ADMIN}/magazyn] 
?>

<?php Templates::startSection("head_content"); ?>

<title>Magazyn</title>

<script>
    <?= preloadProducts() ?>
</script>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="stock_products"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>