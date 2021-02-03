<?php //route[{ADMIN}produkt]

?>

<?php startSection("head_content"); ?>

<title>Produkt</title>



<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Produkt</span>
    <button class="btn primary" onclick="saveProduct()">Zapisz <i class="fa fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>

<product-comp></product-comp>

<div id="selectProductVariant" data-modal data-expand data-dismissable>
    <div class="modal-body">
        <div class="custom-toolbar">
            <span class="title">Wybierz cechy produktu</span>
            <button class="btn primary" onclick="hideParentModal(this)">Ukryj <i class="fas fa-times"></i></button>
        </div>
        <div class="scroll-panel scroll-shadow panel-padding">
            <datatable-comp class="dt_product_features"></datatable-comp>
        </div>
    </div>
</div>

<?php include "admin/page_template.php"; ?>