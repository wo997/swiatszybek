<?php

if (defined("ROUTE") && Request::$found) {
    // TODO: read from bulds info, but doesnt matter rly
    $has_js = true;
    $has_css = true;
} else {
    $has_css = false;
    $has_js = false;
}

$user_cart = User::getCurrent()->cart->getAllData();

?>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0">
<link rel="shortcut icon" href="<?= FAVICON_PATH_LOCAL_TN ?>" />

<?php if (!Request::$is_admin_url) : ?>
    <?= getSetting(["general", "additional_scripts", "header"], "") ?>
<?php endif ?>

<?php if (Request::$is_user_url) : ?>
    <link href="/builds/user.css?v=<?= version("user") ?>" rel="stylesheet">
<?php endif ?>

<?php if (Request::$is_admin_url) : ?>
    <link href="/builds/admin.css?v=<?= version("admin")  ?>" rel="stylesheet">
<?php endif ?>

<link id="main_stylesheet" href="/builds/global.css?v=<?= version("global") ?>" rel="stylesheet">

<?php if (User::getCurrent()->priveleges["backend_access"]) : ?>
    <link href="/builds/admin_everywhere.css?v=<?= version("admin_everywhere") ?>" rel="stylesheet">
<?php endif ?>

<?php if ($has_css) { ?>
    <link href="/<?= BUILDS_PATH . "views" . ROUTE . ".css" ?>?v=<?= version("views" . ROUTE) ?>" rel="stylesheet">
<?php } ?>