<?php //route[{ADMIN}/kategorie-produktow] 
?>

<?php Templates::startSection("head"); ?>

<title>Kategorie produktów</title>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Kategorie produktów
            <div class="hover_info">
                Warto ograniczyć ilośc kategorii i skorzystać z cech produktu żeby zachować przejrzystość sklepu.
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
        </div>
    </span>
    <div class="history_btns_wrapper mla"></div>
    <div class="save_btn_wrapper ml1"></div>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<product-categories-comp class="main"></product-categories-comp>

<?php Templates::startSection("foot"); ?>

<script>
    <?= preloadProductCategories() ?>
</script>

<?php include "bundles/admin/templates/default.php"; ?>