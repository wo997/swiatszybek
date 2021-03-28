<?php

endSection();

?>

<?php startSection("body"); ?>

<?php include "bundles/global/templates/parts/header/header.php";
?>

<?= def($sections, "body_content", ""); ?>

<?php include "bundles/global/templates/blank.php"; ?>