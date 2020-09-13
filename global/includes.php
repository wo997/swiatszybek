<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.12.0/css/all.css">
<link href="https://fonts.googleapis.com/css?family=Nanum+Gothic|Poppins&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">

<script>
  const RELEASE = <?= RELEASE ?>; // manage versioning of assets
  const IS_LOGGED = <?= $app["user"]["id"] ? "true" : "false" ?>;
  const USER_TYPE = "<?= $app["user"]["type"] ?>";

  <?php $sizes = ["lg" => null, "sm" => 800]; ?>

  const status_list = <?= json_encode($status_list) ?>;
  const screenSizes = <?= json_encode($sizes) ?>

  const WEBP_SUPPORT = <?= WEBP_SUPPORT ?>;

  const UPLOADS_PATH = "<?= UPLOADS_PATH ?>";
  const UPLOADS_PLAIN_PATH = "<?= UPLOADS_PLAIN_PATH ?>";

  const image_default_dimensions = <?= json_encode($image_default_dimensions) ?>;

  <?php if ($app["user"]["priveleges"]["backend_access"]) : ?>
    const requiredFilterTables = <?= json_encode($requiredFilterTables) ?>;
    const attribute_data_types = <?= json_encode($attribute_data_types) ?>;
    const privelege_list = <?= json_encode($privelege_list) ?>;

  <?php endif ?>

  const zamowienia_status_groups = <?= json_encode($zamowienia_status_groups) ?>

  var modules = {};

  <?php if ($just_logged_in) : ?>
    window.addEventListener("DOMContentLoaded", () => {
      showNotification("Zalogowano pomyślnie");
    });
  <?php endif ?>
</script>

<!-- styles / scripts to footer? -->
<script src="/builds/global.js?v=<?= JS_RELEASE ?>"></script>
<link href="/builds/global.css?v=<?= CSS_RELEASE ?>" rel="stylesheet">

<?php if (/*$app["user"]["priveleges"]["backend_access"]*/strpos($url, "admin") === 0 || strpos($url, "zamowienie") === 0) : ?>

  <link href="/builds/admin.css?v=<?= CSS_RELEASE ?>" rel="stylesheet">
  <script src="/builds/admin.js?v=<?= JS_RELEASE ?>"></script>
  <script src="/builds/modules.js?v=<?= JS_RELEASE ?>" defer></script>

  <script src="/node_modules/vanillajs-datepicker/dist/js/datepicker-full.js?v=<?= RELEASE ?>"></script>
  <link rel="stylesheet" href="/node_modules/vanillajs-datepicker/dist/css/datepicker.css?v=<?= RELEASE ?>">
  <script src="/node_modules/vanillajs-datepicker/dist/js/locales/pl.js?v=<?= RELEASE ?>"></script>
<?php endif ?>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0">
<link rel="shortcut icon" href="/img/favicon.png" />

<?php if ($url != "produkt" && isset($page_data["seo_description"])) : ?>
  <?php if ($url != "produkt" && isset($page_data["seo_description"])) : ?>
    <meta name="description" content="<?= $page_data["seo_description"] ?>">
    <meta property="og:description" content="<?= $page_data["seo_description"] ?>" />
    <meta name="twitter:description" content="<?= $page_data["seo_description"] ?>" />
    <title><?= $page_data["seo_title"] ?></title>
    <meta property="og:title" content="<?= $page_data["seo_title"] ?>" />
    <meta name="twitter:title" content="<?= $page_data["seo_title"] ?>" />
    <meta name="image" content="/img/padmate_logo.png" />
    <meta property="og:image" content="/img/padmate_logo.png">
    <meta property="og:image:type" content="image/png">
  <?php endif ?>
  <meta property="og:site_name" content="<?= config('main_email_sender') ?>" />
  <meta name="twitter:card" content="summary" />
  <meta property="og:locale" content="pl_PL" />
  <meta property="og:type" content="website" />
<?php endif ?>

<?php if ($app["user"]["priveleges"]["backend_access"] || (isset($page_data) && isset($page_data["cms_id"]))) : ?>

  <link rel="stylesheet" href="/src/range-slider.css?v=<?= RELEASE ?>">
  <script src="/src/range-slider.js?v=<?= RELEASE ?>"></script>

  <script src="/src/highlight.min.js?v=<?= RELEASE ?>"></script>
  <script src="/src/quill-2.0.js?v=<?= RELEASE ?>"></script>

  <!--<script src="/src/quill-better-table.min.js?v=<?= RELEASE ?>"></script>-->

  <!--<link rel="stylesheet" href="/src/quill-better-table.css?v=<?= RELEASE ?>" />-->
<?php endif ?>
<link href="/src/quill.snow.css?v=<?= RELEASE ?>" rel="stylesheet">


<script src="https://apis.google.com/js/platform.js" async defer></script>
<meta name="google-signin-client_id" content="<?= secret('google_client_id') ?>">

<style>
  :root {
    --primary-clr: <?= primary_clr ?>;
    --buynow-clr: <?= buynow_clr ?>;
    --subtle-font-clr: <?= subtle_font_clr ?>;
    --subtle-background-clr: <?= subtle_background_clr ?>;
  }
</style>

<!--<link href="/admin/tools/cms.css?v=<?= RELEASE ?>" rel="stylesheet">-->