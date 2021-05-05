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
    <div class="hover_info">Menu, które wyświetli się na górze każdej strony</div>
    <div class="history_btns_wrapper mla"></div>
    <div class="save_btn_wrapper"></div>
</div>

<?php startSection("body_content"); ?>

<menus-comp class="main"></menus-comp>

<?php include "bundles/admin/templates/default.php"; ?>