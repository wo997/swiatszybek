<?php //route[{ADMIN}/uzytkownicy]

?>

<?php startSection("head_content"); ?>

<title>Użytkownicy</title>

<?php startSection("admin_page_body"); ?>

<datatable-comp class="users"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>