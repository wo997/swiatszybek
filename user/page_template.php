<?php

endSection();

?>

<?php startSection("body"); ?>

<?php include "global/header.php"; ?>
<div class="main-container">
    <?= def($sections, "body_content", ""); ?>
</div>
<?php include "global/footer.php"; ?>

<?php include "global/blank_page_template.php"; ?>