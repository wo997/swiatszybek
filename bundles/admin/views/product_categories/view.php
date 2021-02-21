<?php //route[{ADMIN}kategorie-produktow] 
?>

<?php startSection("head_content"); ?>

<title>Kategorie produktów</title>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Kategorie
        </div>
    </span>
    <div class="history_btns_wrapper"></div>
    <div class="save_btn_wrapper"></div>
</div>

<?php startSection("body_content"); ?>

<div class="categories_wrapper">
    <product-categories-comp class="main"></product-categories-comp>
</div>

<?php include "admin/page_template.php"; ?>