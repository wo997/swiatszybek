<?php ?>

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

    user_cart = <?= json_encode($user_cart) ?>;
    //loadedUserCart();

    last_viewed_products = <?= json_encode(User::getCurrent()->last_viewed_products->getProductsData()) ?>;
    //loadedLastViewedProducts();

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
    <script src="/builds/user.js?v=<?= version("user") ?>"></script>
<?php endif ?>

<?php if (Request::$is_admin_url) : ?>
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
    <script src="/builds/admin_everywhere.js?v=<?= version("admin_everywhere") ?>"></script>
<?php endif ?>

<?php if ($has_js) { ?>
    <script src="/<?= BUILDS_PATH . "views" . ROUTE . ".js" ?>?v=<?= version("views" . ROUTE) ?>"></script>
<?php } ?>

<?php if (DEBUG_MODE) : ?>
    <div data-tooltip="Całkowity czas generowania po stronie serwera" style="position:fixed;font-weight:var(--semi_bold);right:5px;bottom:5px;background:#eee;color:#444;padding:7px 10px;border-radius:5px;box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.24);z-index:100">
        <i class="far fa-clock"></i> <?= round(1000 * (microtime(true) - time)); ?>ms
    </div>
<?php endif ?>

<link rel="preconnect" href="https://fonts.gstatic.com">
<?php
$main_font = def(Theme::$fonts, Theme::getMainFontFamily());
if ($main_font) {
?>
    <link id="main_font" href="<?= $main_font["link"] ?>" rel="stylesheet">
<?php
}

if (Request::$is_admin_url) {
?>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<?php
}

?>

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.0/css/all.css">

<?php if (Request::$is_admin_url || Request::$is_user_url) : ?>
    <?php
    $miscellaneous_version = 1;
    // tbh these could also build, but chill
    ?>
    <script src="/node_modules/vanillajs-datepicker/dist/js/datepicker-full.js?v=<?= $miscellaneous_version ?>"></script>
    <link rel="stylesheet" href="/node_modules/vanillajs-datepicker/dist/css/datepicker.css?v=<?= $miscellaneous_version ?>">
    <script src="/node_modules/vanillajs-datepicker/dist/js/locales/pl.js?v=<?= $miscellaneous_version ?>"></script>

    <script src="/bundles/admin/src/js/vanilla-picker.min.js?v=<?= $miscellaneous_version ?>"></script>

    <script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script>
    <script>
        // @ts-ignore
        Chart.defaults.global.animation.duration = 300;
    </script>
<?php endif ?>

<?php if (!Request::$is_admin_url) : ?>
    <?= getSetting(["general", "additional_scripts", "footer"], "") ?>
<?php endif ?>

<?php if (User::getCurrent()->priveleges["backend_access"]) : ?>
    <script defer src="/builds/wo997_chat.js?v=<?= version("wo997_chat") ?>"></script>
    <link defer href="/builds/wo997_chat.css?v=<?= version("wo997_chat")  ?>" rel="stylesheet">
<?php endif ?>