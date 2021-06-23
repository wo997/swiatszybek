<?php //route[{ADMIN}/kody-rabatowe] 
?>

<?php Templates::startSection("head_content"); ?>

<title>Kody rabatowe</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="rebate_codes"></datatable-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadGeneralProducts() ?>
    <?= preloadUsers() ?>
    <?= preloadRebateCodes() ?>
    <?php if (isset($_GET["utworz"])) { ?>
        domload(() => {
            getRebateCodeModal()._show(-1);
        })
    <?php } ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>