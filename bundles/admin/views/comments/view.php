<?php //route[{ADMIN}/komentarze]

?>

<?php Templates::startSection("head_content"); ?>

<title>Komentarze</title>

<?php Templates::startSection("admin_page_body"); ?>

<datatable-comp class="comments"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>