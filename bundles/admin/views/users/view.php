<?php //route[{ADMIN}/uzytkownicy]

?>

<?php Templates::startSection("head"); ?>

<title>Użytkownicy</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="users"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>