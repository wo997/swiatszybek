<?php //route[{ADMIN}/kategorie-produktow] 
?>

<?php startSection("head_content"); ?>

<title>Kategorie produktów</title>

<script>
    <?= preloadProductCategories() ?>
</script>

<?php startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Kategorie produktów
        </div>
    </span>
    <div class="history_btns_wrapper mla"></div>
    <div class="save_btn_wrapper ml1"></div>
</div>

<?php startSection("body_content"); ?>

<div>
    <p class="user_info" style="margin-bottom:20px">
        <i class="fas fa-info-circle"></i> Warto ograniczyć ilośc kategorii i skorzystać z cech produktu żeby zachować przejrzystość sklepu.
        <br>
        Przykładowo zamiast utworzyć kategorie
        <span class="underline">
            Smartfony
            <i class="fas fa-chevron-right"></i>
            Lista producentów
            <i class="fas fa-chevron-right"></i>
            Modele</span>

        zalecamy<br>utworzyć tylko kategorię <span class="underline">Smartfony</span>
        i oprócz tego cechy produktu taką jak Producent, Model itd.
    </p>
</div>

<product-categories-comp class="main"></product-categories-comp>

<?php include "bundles/admin/templates/default.php"; ?>