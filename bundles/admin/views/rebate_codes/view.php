<?php //route[{ADMIN}/kody-rabatowe] 
?>

<?php Templates::startSection("head_content"); ?>

<title>Kody rabatowe</title>

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

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="rebate_codes"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>