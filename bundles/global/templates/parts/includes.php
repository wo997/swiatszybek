<?php

if (defined("ROUTE")) {
    // TODO: read from bulds info, but doesnt matter rly
    $has_js = true;
    $has_css = true;
} else {
    $has_css = false;
    $has_js = false;
}


?>

<link id="main_stylesheet" href="/builds/global.css?v=<?= version("global") ?>" rel="stylesheet">
<script src="/builds/global.js?v=<?= version("global") ?>"></script>

<script>
    const VERSIONS = <?= json_encode(getScopesVersions()) ?>;

    const IS_LOGGED = <?= User::getCurrent()->isLoggedIn() ? "true" : "false" ?>;
    const USER_ID = <?= User::getCurrent()->getId() ?>;
    const IS_ADMIN = <?= User::getCurrent()->priveleges["backend_access"] ? "true" : "false" ?>;
    const USER_TYPE = "<?= User::getCurrent()->entity->getProp("type") ?>";

    const WEBP_SUPPORT = <?= WEBP_SUPPORT ?>;

    const UPLOADS_PATH = "<?= UPLOADS_PATH ?>";
    const UPLOADS_PLAIN_PATH = "<?= UPLOADS_PLAIN_PATH ?>";

    const image_fixed_dimensions = <?= json_encode(Files::$image_fixed_dimensions) ?>;
    const same_ext_image_allowed_types = <?= json_encode(Files::$same_ext_image_allowed_types) ?>;
    const minify_extensions = <?= json_encode(Files::$minify_extensions) ?>;

    const STATIC_URLS = <?= json_encode(Request::$static_urls) ?>;

    const IS_ADMIN_URL = <?= Request::$is_admin_url ? 1 : 0 ?>;
    const root_class = IS_ADMIN_URL ? "admin_root" : "global_root";

    user_cart = <?= json_encode(User::getCurrent()->cart->getAllData()) ?>;
    loadedUserCart();

    last_viewed_products = <?= json_encode(User::getCurrent()->last_viewed_products->getProductsData()) ?>;
    loadedLastViewedProducts();

    <?php if (Request::getSingleUsageSessionVar("just_logged_in")) : ?>
        domload(() => {
            showNotification(
                `<div class="header">Sukces</div>Zalogowano pomyślnie`,
            );
        });
    <?php endif ?>
    <?php if ($message_modal = Request::getSingleUsageSessionVar("message_modal")) : ?>
        windowload(() => {
            showMessageModal(getMessageHTML(
                <?= $message_modal ?>
            ));
        });
    <?php endif ?>
    <?php if (Request::getSingleUsageSessionVar("login")) : ?>
        domload(() => {
            showModal("loginForm");
        });
    <?php endif ?>
</script>


<?php if (Request::$is_user_url) : ?>
    <link href="/builds/user.css?v=<?= version("user") ?>" rel="stylesheet">
    <script src="/builds/user.js?v=<?= version("user") ?>"></script>
<?php endif ?>

<?php if (Request::$is_admin_url) : ?>
    <link href="/builds/admin.css?v=<?= version("admin")  ?>" rel="stylesheet">
    <script src="/builds/admin.js?v=<?= version("admin")  ?>"></script>

    <script>
        const user_roles = <?= json_encode(User::$user_roles) ?>;
        const responsive_breakpoints = <?= json_encode(Theme::$responsive_breakpoints) ?>;
        const responsive_preview_sizes = <?= json_encode(Theme::$responsive_preview_sizes) ?>;
    </script>
<?php endif ?>

<?php if (Request::$is_admin_url || Request::$is_user_url) : ?>
    <script>
        const physical_measures = <?= json_encode(getPhysicalMeasures()) ?>;
        const feature_data_types = <?= json_encode(getFeatureDataTypes()) ?>;
        const physical_measure_unit_map = <?= json_encode(getPhysicalMeasureUnitMap()) ?>;
    </script>
<?php endif ?>

<?php if (User::getCurrent()->priveleges["backend_access"]) : ?>
    <link href="/builds/admin_front.css?v=<?= version("admin_front") ?>" rel="stylesheet">
    <script src="/builds/admin_front.js?v=<?= version("admin_front") ?>"></script>
<?php endif ?>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0">
<link rel="shortcut icon" href="<?= FAVICON_PATH_LOCAL_TN ?>" />

<meta name="google-signin-client_id" content="<?= secret('google_client_id') ?>">

<style>
    <?php if (User::getCurrent()->isLoggedIn()) : ?>.hide_case_logged_in {
        display: none;
    }

    <?php endif ?>
</style>

<?php if ($has_js) { ?>
    <script src="/<?= BUILDS_PATH . "views" . ROUTE . ".js" ?>?v=<?= version("views" . ROUTE) ?>"></script>
<?php } ?>
<?php if ($has_css) { ?>
    <link href="/<?= BUILDS_PATH . "views" . ROUTE . ".css" ?>?v=<?= version("views" . ROUTE) ?>" rel="stylesheet">
<?php } ?>