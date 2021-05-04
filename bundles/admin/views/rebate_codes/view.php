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

<?php startSection("body_content"); ?>

<datatable-comp class="rebate_codes"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>