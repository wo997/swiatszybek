<?php //route[{ADMIN}/strony]

?>

<?php startSection("head_content"); ?>

<title>Strony</title>

<script>
    <?= preloadProductCategories() ?>
    <?= preloadGeneralProducts() ?>
    <?= preloadTemplates() ?>
    <?php if (isset($_GET["utworz"])) { ?>
        domload(() => {
            add_page_modal = getAddPageModal();
            <?php if (isset($_GET["general_product_id"])) { ?>
                add_page_modal._data.page_type = "general_product";
                add_page_modal._data.general_product_id = <?= intval($_GET["general_product_id"]) ?>;
            <?php } ?>
            add_page_modal._render();
            add_page_modal._show();
        })
    <?php } ?>
</script>

<?php startSection("admin_page_body"); ?>

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