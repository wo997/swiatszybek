<?php //route[{ADMIN}/stawki-vat] 
?>

<?php Templates::startSection("head"); ?>

<title>Stawki VAT</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="vats"></datatable-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadVats() ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>