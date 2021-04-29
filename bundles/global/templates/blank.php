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

<body class="freeze" id="p">
    <div class="main_wrapper">
        <?= def($sections, "body", ""); ?>
        <?php include "bundles/global/templates/parts/footer.php"; ?>
    </div>
</body>

</html>