<?php //route[{ADMIN}/strony]

?>

<?php startSection("head_content"); ?>

<title>Strony</title>

<script>
    <?= preloadProductCategories() ?>
    <?= preloadGeneralProducts() ?>
</script>

<?php startSection("body_content"); ?>

<div class="pages_view_header">
    <div class="pretty_radio semi_bold toggle_view">
        <div class="checkbox_area">
            <p-checkbox data-value="pages"></p-checkbox>
            <span>
                <i class="fas fa-file-alt"></i>
                Zwykłe strony
            </span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="general_products"></p-checkbox>
            <span>
                <i class="fas fa-cube"></i>
                Produkty
            </span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="product_categories"></p-checkbox>
            <span>
                <i class="fas fa-cubes"></i>
                Kategorie produktów
            </span>
        </div>
    </div>

    <a href="<?= Request::$static_urls["ADMIN"] ?>/strona" class="btn primary" onclick="getAddPageModal()._show({source:this});return false;">
        Utwórz stronę <i class="fas fa-plus"></i>
    </a>
</div>

<datatable-comp class="pages"></datatable-comp>

<datatable-comp class="general_products"></datatable-comp>

<datatable-comp class="product_categories"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>