<?php //route[/experimental]

$main_menu = def(PiepCMSManager::$modules, ["main_menu"]);

global $modified_packages;

?>

<?php startSection("head_content"); ?>

<title>Experimental</title>

<?php startSection("body"); ?>

<header class="main">
    <?= $main_menu["render"]() ?>
</header>

<link href="/<?= $main_menu["css_path"] . "?v=" . ASSETS_RELEASE ?>" rel="stylesheet">
<script src="/<?= $main_menu["js_path"] . "?v=" . ASSETS_RELEASE ?>"></script>

<?= join(",", $modified_packages) ?>

<?php include "bundles/global/templates/blank.php"; ?>