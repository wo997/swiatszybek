<?php //route[/{ADMIN}produkty] 
?>

<?php startSection("head_content"); ?>

<title>Produkty</title>

<?php startSection("body_content"); ?>

<datatable-comp class="products"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>