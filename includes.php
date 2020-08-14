<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.12.0/css/all.css">
<link href="https://fonts.googleapis.com/css?family=Nanum+Gothic|Poppins&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">

<?php if (/*$app["user"]["is_admin"]*/strpos($url, "admin") === 0 || strpos($url, "zamowienie") === 0) : ?>
  <!-- <script src="/src/vanilla.datepicker.js" type="text/javascript" charset="utf-8"></script>
  <link rel="stylesheet" href="/src/vanilla.datepicker.css?v=1" type="text/css" media="screen" /> -->

  <link href="/admin/shared.css?v=<?= RELEASE ?>" rel="stylesheet">
  <script src="/admin/shared.js?v=<?= RELEASE ?>"></script>

  <script src="/src/jscolor.js?v=<?= RELEASE ?>"></script>
<?php endif ?>

<link href="/src/shared.css?v=<?= RELEASE ?>" rel="stylesheet">
<script src="/src/shared.js?v=<?= RELEASE ?>"></script>
<script src="/node_modules/vanillajs-datepicker/dist/js/datepicker-full.js?v=<?= RELEASE ?>"></script>
<link rel="stylesheet" href="/node_modules/vanillajs-datepicker/dist/css/datepicker.min.css?v=<?= RELEASE ?>">
<script src="/node_modules/vanillajs-datepicker/dist/js/locales/pl.js?v=<?= RELEASE ?>"></script>

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

<?php if ($app["user"]["is_admin"] || (isset($page_data) && isset($page_data["cms_id"]))) : ?>

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

<script>
  var RELEASE = <?= RELEASE ?>; // manage versioning of assets
  var IS_LOGGED = <?= $app["user"]["id"] ? "true" : "false" ?>;
  var USER_TYPE = "<?= $app["user"]["type"] ?>";

  <?php $sizes = ["lg" => null, "sm" => 800]; ?>

  var statusList = <?= json_encode($statusList) ?>;
  var screenSizes = <?= json_encode($sizes) ?>

  var image_default_dimensions = <?= json_encode($image_default_dimensions) ?>;

  <?php if ($app["user"]["is_admin"]) : ?>
    var requiredFilterTables = <?= json_encode($requiredFilterTables) ?>;
    var attribute_data_types = <?= json_encode($attribute_data_types) ?>
  <?php endif ?>
</script>

<link href="/admin/tools/cms.css?v=<?= RELEASE ?>" rel="stylesheet">