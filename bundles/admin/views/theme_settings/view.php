<?php //route[{ADMIN}/ustawienia-motywu]

?>

<?php startSection("head_content"); ?>

<title>Szablon</title>

<script>
    <?= preloadColorPalette() ?>
</script>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Ustawienia motywu
        </div>
    </span>
</div>

<?php startSection("body_content"); ?>

<theme-settings-comp class="main"></theme-settings-comp>

<?php include "bundles/admin/templates/default.php"; ?>