<?php //route[{ADMIN}/pliki-zdjecia]

?>

<?php Templates::startSection("head"); ?>

<title>Pliki / Zdięcia</title>

<?php Templates::startSection("header"); ?>



<?php Templates::startSection("admin_page_body"); ?>

<file-manager-comp class="files"></file-manager-comp>

<?php include "bundles/admin/templates/default.php"; ?>