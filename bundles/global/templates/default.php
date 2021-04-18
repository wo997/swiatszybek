<?php

endSection();

?>

<?php startSection("body"); ?>

<div class="global_root">
    <?php include "bundles/global/templates/parts/header/header.php"; ?>

    <?= def($sections, "body_content", ""); ?>
</div>

<?php include "bundles/global/templates/blank.php"; ?>