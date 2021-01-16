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
    <div class="main-container">
        <?= def($sections, "body", ""); ?>
    </div>
</body>

</html>