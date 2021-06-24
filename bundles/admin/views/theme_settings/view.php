<?php //route[{ADMIN}/ustawienia-motywu]

?>

<?php Templates::startSection("head"); ?>

<title>Ustawienia motywu</title>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs mra">
        <div class="crumb">
            Ustawienia motywu
        </div>
    </span>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<theme-settings-comp class="main"></theme-settings-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= Theme::preloadThemeSettings() ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>