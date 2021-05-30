<?php //route[/experimental]

$main_menu = def(PiepCMSManager::$modules, ["main_menu"]);

?>

<?php Templates::startSection("head_content"); ?>

<title>Experimental</title>

<?php Templates::startSection("body"); ?>

<header class="main">
    <?= $main_menu["render"]() ?>
</header>

<link href="/<?= $main_menu["css_path"] . "?v=" . version("modules/main_menu") ?>" rel="stylesheet">
<script src="/<?= $main_menu["js_path"] . "?v=" . version("modules/main_menu") ?>"></script>

<?php include "bundles/global/templates/blank.php"; ?>