<?php //route[{ADMIN}/kody-rabatowe] 
?>

<?php startSection("head_content"); ?>

<title>Kody rabatowe</title>

<script>
    <?php if (isset($_GET["utworz"])) { ?>
        domload(() => {
            getRebateCodeModal()._show(-1);
        })
    <?php } ?>
</script>

<?php startSection("admin_page_body"); ?>

<datatable-comp class="rebate_codes"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>