<?php

endSection();

?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <?php include "global/includes.php"; ?>
    <?= def($sections, "head_content", ""); ?>
</head>

<body>
    <div class="main_wrapper">
        <div class="main_container">
            <?= def($sections, "body", ""); ?>
            <?php include "global/footer.php"; ?>
        </div>
    </div>
</body>

</html>