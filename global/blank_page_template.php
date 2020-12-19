<?php

endSection();

?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <?php include "global/includes.php"; ?>
    <?= nonull($sections, "head_content", ""); ?>
</head>

<?= nonull($sections, "body", ""); ?>

</html>