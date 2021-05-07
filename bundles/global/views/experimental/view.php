<?php //route[/experimental]

$main_menu = def(PiepCMSManager::$modules, ["main_menu"]);

?>

<?php startSection("head_content"); ?>

<title>Experimental</title>

<?php startSection("body"); ?>

<header class="main">
    <?= $main_menu["render"]() ?>
</header>

<link href="/<?= $main_menu["css"] . "?v=" . ASSETS_RELEASE ?>" rel="stylesheet">
<script src="/<?= $main_menu["js"] . "?v=" . ASSETS_RELEASE ?>"></script>

<?php include "bundles/global/templates/blank.php"; ?>