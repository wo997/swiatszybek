<?php //route[{ADMIN}/ustawienia-motywu]

?>

<?php startSection("head_content"); ?>

<title>Ustawienia motywu</title>

<script>
    <?= Theme::preloadThemeSettings() ?>
</script>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Ustawienia motywu
        </div>
    </span>
</div>

<?php startSection("admin_page_body"); ?>

<theme-settings-comp class="main"></theme-settings-comp>

<?php include "bundles/admin/templates/default.php"; ?>