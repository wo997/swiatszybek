<?php //route[{ADMIN}/szablony]

?>

<?php Templates::startSection("head_content"); ?>

<title>Szablony</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="templates"></datatable-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadTemplates() ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>