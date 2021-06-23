<?php //route[{ADMIN}/oczekujacy]

?>

<?php Templates::startSection("head"); ?>

<title>Oczekujący na produkty</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="product_queue"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>