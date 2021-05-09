<div class="offline"><i class="fas fa-exclamation-circle"></i> Brak połączenia z internetem!</div>
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

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.12.0/css/all.css">

<?php if (Request::$is_admin_url || Request::$is_user_url) : ?>
    <script src="/node_modules/vanillajs-datepicker/dist/js/datepicker-full.js?v=<?= version("global") ?>"></script>
    <link rel="stylesheet" href="/node_modules/vanillajs-datepicker/dist/css/datepicker.css?v=<?= version("global") ?>">
    <script src="/node_modules/vanillajs-datepicker/dist/js/locales/pl.js?v=<?= version("global") ?>"></script>

    <!-- <script src="/bundles/admin/src/js/jscolor.js?v=<?= version("global") ?>"></script> -->
    <script src="/bundles/admin/src/js/vanilla-picker.min.js?v=<?= version("global") ?>"></script>

    <script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script>
    <script>
        // @ts-ignore
        Chart.defaults.global.animation.duration = 300;
    </script>
<?php endif ?>