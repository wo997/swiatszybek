<?php //route[{ADMIN}/menu-glowne] 
?>

<?php startSection("head_content"); ?>

<title>Menu główne</title>

<script>
    <?= preloadMenus() ?>
    <?= preloadProductCategories() ?>
    <?= preloadGeneralProducts() ?>
</script>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Menu główne
        </div>
    </span>
    <div class="history_btns_wrapper"></div>
    <div class="save_btn_wrapper"></div>
</div>

<?php startSection("body_content"); ?>

<div>
    <p class="user_info" style="margin-bottom:20px">
        <i class="fas fa-info-circle"></i> Jakiś opis się pojawi
    </p>
</div>

<menus-comp class="main"></menus-comp>

<?php include "bundles/admin/templates/default.php"; ?>