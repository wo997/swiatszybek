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

<datatable-comp></datatable-comp>

<?php include "admin/page_template.php"; ?>