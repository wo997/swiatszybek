<?php

endSection();

?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <?php include "global/includes.php"; ?>
    <?php if (isset($sections["head"])) echo $sections["head"]; ?>
</head>

<body>
    <div class="main-container">
        <?php include "global/header.php"; ?>
        <div class="main-container">
            <?php if (isset($sections["content"])) echo $sections["content"]; ?>
        </div>
        <?php include "global/footer.php"; ?>
    </div>
</body>

</html>