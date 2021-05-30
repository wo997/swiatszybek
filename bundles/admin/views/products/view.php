<?php //route[{ADMIN}/produkty] 
?>

<?php Templates::startSection("head_content"); ?>

<title>Produkty</title>

<script>
    <?= preloadProductCategories() ?>
    <?php if (isset($_GET["dodaj"])) { ?>
        domload(() => {
            showAddProductModal();
        })
    <?php } ?>
</script>

<?php Templates::startSection("admin_page_body"); ?>

<div class="products_view_header">
    <div class="pretty_radio semi_bold toggle_view">
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

    <button class="btn primary" onclick="showAddProductModal({source:this});"> Dodaj produkt <i class="fas fa-plus"></i> </button>
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