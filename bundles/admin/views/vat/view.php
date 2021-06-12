<?php //route[{ADMIN}/stawki-vat] 
?>

<?php Templates::startSection("head_content"); ?>

<title>Stawki VAT</title>

<script>
    <?= preloadVats() ?>
</script>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="vats"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>