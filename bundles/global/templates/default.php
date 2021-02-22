<?php

endSection();

?>

<?php startSection("body"); ?>

<?php include "global/header.php"; ?>

<?= def($sections, "body_content", ""); ?>

<?php include "global/blank_page_template.php"; ?>