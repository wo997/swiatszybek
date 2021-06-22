<?php

Templates::endSection();

?>
<!DOCTYPE html>
<html lang="pl">

<head>
    <?php include "bundles/global/templates/parts/head.php"; ?>
    <?= def(Templates::$sections, "head_content", ""); ?>
</head>

<body class="freeze" id="p">
    <?= def(Templates::$sections, "body", ""); ?>
    <?php include "bundles/global/templates/parts/foot.php"; ?>
    <?= def(Templates::$sections, "foot", ""); ?>
</body>

</html>