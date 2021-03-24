<?php //route[{ADMIN}/produkty] 
?>

<?php startSection("head_content"); ?>

<title>Produkty</title>

<?php startSection("body_content"); ?>

<div class="products_view_header">
    <div class="radio_group boxes pretty_blue hide_checks semi_bold toggle_view inline_flex glue_children">
        <div class="checkbox_area box">
            <p-checkbox data-value="general_products"></p-checkbox>
            <span>
                <i class="fas fa-cubes"></i>
                Przeglądaj produkty
            </span>
        </div>
        <div class="checkbox_area box">
            <p-checkbox data-value="products"></p-checkbox>
            <span>
                <i class="fas fa-list-ol"></i>
                Zarządzaj magazynem
            </span>
        </div>
    </div>

    <button class="btn subtle" style="margin:0 5px">
        <i class="fas fa-filter"></i>
        Filtry
    </button>

    <a href="<?= Request::$static_urls["ADMIN"] ?>/produkt" class="btn primary"> Dodaj produkt <i class="fas fa-plus"></i> </a>
</div>


<datatable-comp class="general_products"></datatable-comp>

<datatable-comp class="products"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>