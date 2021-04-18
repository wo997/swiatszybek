<?php
// TODO: no
if (!def($page_data, "seo_image", "")) {
    $page_data["seo_image"] = SHARE_IMG_PATH_PUBLIC_SM;
}

if (defined("ROUTE")) {
    $js_schema = Assets::getJsSchema();
    $groups = def($js_schema, "files_groups", []);
    $has_js = isset($groups["views" . ROUTE]);

    $css_schema = Assets::getCssSchema();
    $groups = def($css_schema, "files_groups", []);
    $has_css = isset($groups["views" . ROUTE]);
} else {
    $has_css = false;
    $has_js = false;
}
?>

<link id="main_stylesheet" href="/builds/global.css?v=<?= ASSETS_RELEASE ?>" rel="stylesheet">
<script src="/builds/global.js?v=<?= ASSETS_RELEASE ?>"></script>

<script>
    // TODO: should go to cookie maybe window.devicePixelRatio, probably no
    const ASSETS_RELEASE = <?= ASSETS_RELEASE ?>;

    const IS_LOGGED = <?= User::getCurrent()->isLoggedIn() ? "true" : "false" ?>;
    const USER_ID = <?= User::getCurrent()->getId() ?>;
    const IS_ADMIN = <?= User::getCurrent()->priveleges["backend_access"] ? "true" : "false" ?>;
    const USER_TYPE = "<?= User::getCurrent()->entity->getProp("type") ?>";

    const WEBP_SUPPORT = <?= WEBP_SUPPORT ?>;

    const UPLOADS_PATH = "<?= UPLOADS_PATH ?>";
    const UPLOADS_PLAIN_PATH = "<?= UPLOADS_PLAIN_PATH ?>";

    const image_fixed_dimensions = <?= json_encode(Files::$image_fixed_dimensions) ?>;
    const same_ext_image_allowed_types = <?= json_encode(Files::$same_ext_image_allowed_types) ?>;

    user_cart = <?= json_encode(User::getCurrent()->cart->getAllData()) ?>;
    loadedUserCart();

    last_viewed_products = <?= json_encode(User::getCurrent()->last_viewed_products->getProductsData()) ?>;
    loadedLastViewedProducts();

    <?php if (User::getCurrent()->priveleges["backend_access"]) : ?>
        <?php if (isset($preview_params) && isset($preview_params["js_visible"])) : ?>
            //const preview_params = <?= json_encode($preview_params["js_visible"]) ?>;
        <?php endif ?>
    <?php endif ?>

    <?php if (Request::getSingleUsageSessionVar("just_logged_in")) : ?>
        domload(() => {
            showNotification("Zalogowano pomyślnie", {
                one_line: true,
                type: "success",
            });
        });
    <?php endif ?>

    <?php if ($message_modal = Request::getSingleUsageSessionVar("message_modal")) : ?>
        windowload(() => {
            showMessageModal(getMessageHTML(
                <?= $message_modal ?>
            ));
        });
    <?php endif ?>

    window.addEventListener("modal_show", (event) => {
        var node = event.detail.node;

        if (!node || node.id != "loginForm") {
            return;
        }
        loadScript("https://apis.google.com/js/platform.js");
        loadScript("https://connect.facebook.net/pl_PL/sdk.js#xfbml=1&version=v6.0&appId=<?= secret('facebook_app_id') ?>&autoLogAppEvents=1", {
            crossorigin: "anonymous"
        });
    });

    <?php if (Request::getSingleUsageSessionVar("login")) : ?>
        domload(() => {
            showModal("loginForm");
        });
    <?php endif ?>

    const STATIC_URLS = <?= json_encode(Request::$static_urls) ?>;
</script>

<?php if (Request::$is_user_url) : ?>
    <link href="/builds/user.css?v=<?= ASSETS_RELEASE ?>" rel="stylesheet">
    <script src="/builds/user.js?v=<?= ASSETS_RELEASE ?>"></script>
<?php endif ?>

<?php if (Request::$is_admin_url) : ?>
    <link href="/builds/admin.css?v=<?= ASSETS_RELEASE ?>" rel="stylesheet">
    <script src="/builds/admin.js?v=<?= ASSETS_RELEASE ?>"></script>

    <script>
        const user_roles = <?= json_encode(User::$user_roles) ?>;
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
    <link href="/builds/admin_front.css?v=<?= ASSETS_RELEASE ?>" rel="stylesheet">
    <script src="/builds/admin_front.js?v=<?= ASSETS_RELEASE ?>"></script>
<?php endif ?>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0">
<link rel="shortcut icon" href="<?= FAVICON_PATH_LOCAL_TN ?>" />

<?php if (isset($page_data["seo_description"])) : ?>
    <meta name="description" content="<?= $page_data["seo_description"] ?>">
    <meta property="og:description" content="<?= $page_data["seo_description"] ?>" />
    <meta name="twitter:description" content="<?= $page_data["seo_description"] ?>" />
    <title><?= $page_data["seo_title"] ?></title>
    <meta property="og:title" content="<?= $page_data["seo_title"] ?>" />
    <meta name="twitter:title" content="<?= $page_data["seo_title"] ?>" />
    <meta name="image" content="<?= $page_data["seo_image"] ?>">
    <meta property="og:image" content="<?= $page_data["seo_image"] ?>">
    <meta property="og:image:type" content="image/png">
    <meta property="og:site_name" content="<?= getSetting(["general", "company", "shop_name"], "") ?>" />
    <meta name="twitter:card" content="summary" />
    <meta property="og:locale" content="pl_PL" />
    <meta property="og:type" content="website" />
<?php endif ?>

<meta name="google-signin-client_id" content="<?= secret('google_client_id') ?>">

<style>
    <?php if (User::getCurrent()->isLoggedIn()) : ?>.hide_case_logged_in {
        display: none;
    }

    <?php endif ?>
</style>

<?php if ($has_js) { ?>
    <script src="/<?= BUILDS_PATH . "views/" . ROUTE . ".js" ?>?v=<?= ASSETS_RELEASE ?>"></script>
<?php } ?>
<?php if ($has_css) { ?>
    <link href="/<?= BUILDS_PATH . "views/" . ROUTE . ".css" ?>?v=<?= ASSETS_RELEASE ?>" rel="stylesheet">
<?php } ?>