<?php //route[{ADMIN}kategorie-produktow] 
?>

<?php startSection("head_content"); ?>

<title>Kategorie produktów</title>

<script>
    <?= preloadProductCategories() ?>
</script>

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

<div>
    <p class="user_info" style="margin-top:0">
        <i class="fas fa-info-circle"></i> Warto ograniczyć ilośc kategorii i skorzystać z cech produktu żeby zachować przejrzystość sklepu.
        <br>
        Przykładowo zamiast utworzyć kategorie
        <span style="text-decoration: underline;">
            Smartfony
            <i class="fas fa-chevron-right"></i>
            Lista producentów
            <i class="fas fa-chevron-right"></i>
            Modele
        </span>
        .
        Zalecamy<br>utworzyć tylko kategorię <span style="text-decoration: underline;">Smartfony</span>
        i oprócz tego cechy produktu taką jak Producent, Model itd.
    </p>
</div>

<product-categories-comp></product-categories-comp>

<?php include "bundles/admin/templates/default.php"; ?>