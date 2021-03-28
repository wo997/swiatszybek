<?php //route[{ADMIN}/produkty] 
?>

<?php startSection("head_content"); ?>

<title>Produkty</title>

<script>
    <?= preloadProductCategories() ?>
</script>

<?php startSection("body_content"); ?>

<div class="products_view_header">
    <div class="radio_group boxes pretty_blue hide_checks semi_bold toggle_view inline_flex glue_children">
        <div class="checkbox_area">
            <p-checkbox data-value="general_products"></p-checkbox>
            <span>
                <i class="fas fa-cubes"></i>
                Przeglądaj produkty
            </span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="products"></p-checkbox>
            <span>
                <i class="fas fa-sort-numeric-up"></i>
                Zarządzaj magazynem
            </span>
        </div>
    </div>

    <a href="<?= Request::$static_urls["ADMIN"] ?>/produkt" class="btn primary"> Dodaj produkt <i class="fas fa-plus"></i> </a>
</div>

<div class="products_view_header_under">
    <button class="btn subtle show_filters">
        <i class="fas fa-list-ul"></i>
        Kategorie
    </button>
    <div class="btn error_light unselect_categories_btn" style="margin-left:3px" data-tooltip="Pokaż wszystkie produkty">
        <i class="fas fa-times"></i>
    </div>
    <span class="semi_bold what_categories_label" style="margin-left:7px"></span>
</div>


<datatable-comp class="general_products"></datatable-comp>

<datatable-comp class="products"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>