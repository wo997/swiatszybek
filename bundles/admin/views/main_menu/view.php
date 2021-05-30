<?php //route[{ADMIN}/menu-glowne] 
?>

<?php Templates::startSection("head_content"); ?>

<title>Menu główne</title>

<script>
    <?= preloadMenus() ?>
    <?= preloadProductCategories() ?>
    <?= preloadGeneralProducts() ?>
    <?= preloadPages() ?>
</script>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Menu główne
        </div>
    </span>
    <div class="hover_info">Menu, które wyświetli się na górze każdej strony</div>
    <div class="history_btns_wrapper mla"></div>
    <div class="save_btn_wrapper ml1"></div>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<menus-comp class="main"></menus-comp>

<?php include "bundles/admin/templates/default.php"; ?>