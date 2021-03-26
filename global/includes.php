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

<link href="/builds/global.css?v=<?= ASSETS_RELEASE ?>" rel="stylesheet">
<script src="/builds/global.js?v=<?= ASSETS_RELEASE ?>"></script>

<script>
    // TODO: should go to cookie maybe window.devicePixelRatio, probably no
    const ASSETS_RELEASE = <?= ASSETS_RELEASE ?>;

    const IS_LOGGED = <?= User::getCurrent()->isLoggedIn() ? "true" : "false" ?>;
    const USER_ID = <?= User::getCurrent()->getId() ?>;
    const IS_ADMIN = <?= User::getCurrent()->priveleges["backend_access"] ? "true" : "false" ?>;
    const USER_TYPE = "<?= User::getCurrent()->entity->getProp("type") ?>";

    <?php $sizes = ["lg" => null, "sm" => 800]; ?>

    const status_list = <?= json_encode($status_list) ?>;
    const screenSizes = <?= json_encode($sizes) ?>

    const WEBP_SUPPORT = <?= WEBP_SUPPORT ?>;

    const UPLOADS_PATH = "<?= UPLOADS_PATH ?>";
    const UPLOADS_PLAIN_PATH = "<?= UPLOADS_PLAIN_PATH ?>";

    const image_fixed_dimensions = <?= json_encode(Files::$image_fixed_dimensions) ?>;
    const same_ext_image_allowed_types = <?= json_encode(Files::$same_ext_image_allowed_types) ?>;

    user_cart = <?= json_encode(User::getCurrent()->cart->getAllData()) ?>;
    loadedUserCart(true);

    <?php if (User::getCurrent()->priveleges["backend_access"]) : ?>
        const feature_data_types = <?= json_encode(getFeatureDataTypes()) ?>;

        <?php if (isset($preview_params) && isset($preview_params["js_visible"])) : ?>
            //const preview_params = <?= json_encode($preview_params["js_visible"]) ?>;
        <?php endif ?>
    <?php endif ?>
    const physical_measures = <?= json_encode(getPhysicalMeasures()) ?>;

    const zamowienia_status_groups = <?= json_encode($zamowienia_status_groups) ?>

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

    const last_viewed_products_ids = <?= json_encode(getLastViewedProductsIds()) ?>;
    const last_viewed_products = <?= json_encode(getLastViewedProducts()) ?>;

    const STATIC_URLS = <?= json_encode(Request::$static_urls) ?>;
</script>

<?php if (Request::$is_admin_url) : ?>
    <link href="/builds/admin.css?v=<?= ASSETS_RELEASE ?>" rel="stylesheet">
    <script src="/builds/admin.js?v=<?= ASSETS_RELEASE ?>"></script>

    <script src="/builds/app_modules.js?v=<?= ASSETS_RELEASE ?>" defer></script>
    <script src="/builds/app_module_blocks.js?v=<?= ASSETS_RELEASE ?>" defer></script>

    <script src="/node_modules/vanillajs-datepicker/dist/js/datepicker-full.js?v=<?= ASSETS_RELEASE ?>"></script>
    <link rel="stylesheet" href="/node_modules/vanillajs-datepicker/dist/css/datepicker.css?v=<?= ASSETS_RELEASE ?>">
    <script src="/node_modules/vanillajs-datepicker/dist/js/locales/pl.js?v=<?= ASSETS_RELEASE ?>"></script>

    <script src="/src/jscolor.js?v=<?= ASSETS_RELEASE ?>"></script>

    <script src="/src/highlight.min.js?v=<?= ASSETS_RELEASE ?>"></script>
    <script src="/src/quill-2.0.js?v=<?= ASSETS_RELEASE ?>"></script>
<?php endif ?>

<?php if (User::getCurrent()->priveleges["backend_access"]) : ?>

    <link href="/builds/admin_everywhere.css?v=<?= ASSETS_RELEASE ?>" rel="stylesheet">
    <script src="/builds/admin_everywhere.js?v=<?= ASSETS_RELEASE ?>"></script>

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
    <meta property="og:site_name" content="<?= $app["company_data"]['email_sender'] ?>" />
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