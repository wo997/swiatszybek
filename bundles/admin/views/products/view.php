<?php //route[{ADMIN}/produkty] 
?>

<?php Templates::startSection("head"); ?>

<title>Produkty</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="general_products"></datatable-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadProductCategories() ?>
    <?php if (isset($_GET["dodaj"])) { ?>
        domload(() => {
            showAddProductModal();
        })
    <?php } ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>