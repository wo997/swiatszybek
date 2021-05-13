<?php //route[{ADMIN}/komentarze]

?>

<?php startSection("head_content"); ?>

<title>Komentarze</title>

<?php startSection("admin_page_body"); ?>

<datatable-comp class="comments"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>