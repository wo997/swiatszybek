<?php //route[{ADMIN}/szablony]

?>

<?php startSection("head_content"); ?>

<title>Szablony</title>

<script>
    <?= preloadTemplates() ?>
</script>

<?php startSection("admin_page_body"); ?>

<datatable-comp class="templates"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>