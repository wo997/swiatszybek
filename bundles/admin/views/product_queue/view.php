<?php //route[{ADMIN}/oczekujacy]

?>

<?php startSection("head_content"); ?>

<title>Oczekujący na produkty</title>

<?php startSection("admin_page_body"); ?>

<datatable-comp class="product_queue"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>