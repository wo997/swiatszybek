<?php //route[{ADMIN}/wszystkie-produkty]
?>

<?php Templates::startSection("head"); ?>

<title>Wszystkie produkty</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="products"></datatable-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadVats() ?>
    <?= preloadProductCategories() ?>
    <?php if (isset($_GET["dodaj"])) { ?>
        domload(() => {
            showAddProductModal();
        })
    <?php } ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>