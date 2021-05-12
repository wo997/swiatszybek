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
    <?= def($sections, "body", ""); ?>
    <?php include "bundles/global/templates/parts/footer.php"; // not layout tho 
    ?>
</body>

</html>