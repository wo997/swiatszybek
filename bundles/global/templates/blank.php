<?php

endSection();

?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <?php include "bundles/global/templates/parts/includes.php";
    ?>
    <?= def($sections, "head_content", ""); ?>
</head>

<body class="freeze">
    <div class="main_wrapper">
        <div class="main_container">
            <?= def($sections, "body", ""); ?>
            <?php include "bundles/global/templates/parts/footer.php"; ?>
        </div>
    </div>
</body>

</html>