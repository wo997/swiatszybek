<?php //route[{ADMIN}/szablony]

?>

<?php Templates::startSection("head_content"); ?>

<title>Szablony</title>

<script>
    <?= preloadTemplates() ?>
</script>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="templates"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>