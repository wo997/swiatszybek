<?php

endSection();

?>

<?php startSection("body"); ?>

<body>
    <div class="main-container">
        <?php include "global/header.php"; ?>
        <div class="main-container">
            <?= def($sections, "body_content", ""); ?>
        </div>
        <?php include "global/footer.php"; ?>
    </div>
</body>

<?php include "global/blank_page_template.php"; ?>