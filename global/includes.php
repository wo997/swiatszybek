<?php
if (!isset($page_data["seo_image"])) {
  $page_data["seo_image"] = "/img/padmate_logo.png";
}
?>

<script>
  const RELEASE = <?= RELEASE ?>; // general asset version
  const JS_RELEASE = <?= JS_RELEASE ?>;
  const CSS_RELEASE = <?= CSS_RELEASE ?>;
  const MODULES_RELEASE = <?= MODULES_RELEASE ?>;

  const IS_LOGGED = <?= $app["user"]["id"] ? "true" : "false" ?>;
  const USER_ID = <?= nonull($app["user"], "id", 0) ?>;
  const IS_ADMIN = <?= $app["user"]["priveleges"]["backend_access"] ? "true" : "false" ?>;
  const USER_TYPE = "<?= $app["user"]["type"] ?>";

  <?php $sizes = ["lg" => null, "sm" => 800]; ?>

  const status_list = <?= json_encode($status_list) ?>;
  const screenSizes = <?= json_encode($sizes) ?>

  const WEBP_SUPPORT = <?= WEBP_SUPPORT ?>;

  const UPLOADS_PATH = "<?= UPLOADS_PATH ?>";
  const UPLOADS_PLAIN_PATH = "<?= UPLOADS_PLAIN_PATH ?>";

  function domload(callback) {
    document.addEventListener("DOMContentLoaded", callback);
  }

  function windowload(callback) {
    window.addEventListener("load", callback);
  }

  const image_default_dimensions = <?= json_encode($image_default_dimensions) ?>;

  <?php if ($app["user"]["priveleges"]["backend_access"]) : ?>
    const requiredFilterTables = <?= json_encode($requiredFilterTables) ?>;
    const attribute_data_types = <?= json_encode($attribute_data_types) ?>;
    const privelege_list = <?= json_encode($privelege_list) ?>;

  <?php endif ?>

  const zamowienia_status_groups = <?= json_encode($zamowienia_status_groups) ?>

  <?php if ($just_logged_in) : ?>
    domload(() => {
      showNotification("Zalogowano pomyślnie");
    });
  <?php endif ?>

  <?php if (isset($_SESSION["message_modal"])) : ?>
    window.addEventListener("load", () => {
      showMessageModal(`<?= $_SESSION["message_modal"] ?>`);
      <?php unset($_SESSION["message_modal"]); ?>
    });
  <?php endif ?>

  window.addEventListener("modal-show", (event) => {
    var node = event.detail.node;

    if (!node || node.id != "loginForm") {
      return;
    }
    loadScript("https://apis.google.com/js/platform.js");
    loadScript("https://connect.facebook.net/pl_PL/sdk.js#xfbml=1&version=v6.0&appId=<?= secret('facebook_app_id') ?>&autoLogAppEvents=1", {
      crossorigin: "anonymous"
    });
  });

  function basketReady() {
    _setBasketData(<?= json_encode(getBasketDataAll()) ?>, {
      instant: true
    });
  };

  /*domload(() => {
    _setBasketData(window.basket_data);
  })*/
</script>

<!-- styles / scripts to footer? -->
<script src="/builds/global.js?v=<?= JS_RELEASE ?>"></script>
<link href="/builds/global.css?v=<?= CSS_RELEASE ?>" rel="stylesheet">

<?php if (strpos($url, "admin") === 0 || strpos($url, "zamowienie") === 0) : ?>

  <script>
    const link_module_block_form_path = <?= json_encode($link_module_block_form_path) ?>;
  </script>

  <link href="/builds/admin.css?v=<?= CSS_RELEASE ?>" rel="stylesheet">
  <script src="/builds/admin.js?v=<?= JS_RELEASE ?>"></script>

  <script src="/builds/app_modules.js?v=<?= MODULES_RELEASE ?>" defer></script>
  <script src="/builds/app_module_blocks.js?v=<?= MODULES_RELEASE ?>" defer></script>

  <script src="/node_modules/vanillajs-datepicker/dist/js/datepicker-full.js?v=<?= RELEASE ?>"></script>
  <link rel="stylesheet" href="/node_modules/vanillajs-datepicker/dist/css/datepicker.css?v=<?= RELEASE ?>">
  <script src="/node_modules/vanillajs-datepicker/dist/js/locales/pl.js?v=<?= RELEASE ?>"></script>

  <link rel="stylesheet" href="/src/range-slider.css?v=<?= RELEASE ?>">
  <script src="/src/range-slider.js?v=<?= RELEASE ?>"></script>

  <script src="/src/highlight.min.js?v=<?= RELEASE ?>"></script>
  <script src="/src/quill-2.0.js?v=<?= RELEASE ?>"></script>
<?php endif ?>

<?php if ($app["user"]["priveleges"]["backend_access"]) : ?>

  <link href="/builds/admin_everywhere.css?v=<?= CSS_RELEASE ?>" rel="stylesheet">
  <script src="/builds/admin_everywhere.js?v=<?= JS_RELEASE ?>"></script>

<?php endif ?>



<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0">
<link rel="shortcut icon" href="/img/favicon.png" />

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
  <meta property="og:site_name" content="<?= config('main_email_sender') ?>" />
  <meta name="twitter:card" content="summary" />
  <meta property="og:locale" content="pl_PL" />
  <meta property="og:type" content="website" />
<?php endif ?>

<meta name="google-signin-client_id" content="<?= secret('google_client_id') ?>">

<style>
  :root {
    --primary-clr: <?= primary_clr ?>;
    --buynow-clr: <?= buynow_clr ?>;
    --subtle-font-clr: <?= subtle_font_clr ?>;
    --subtle-background-clr: <?= subtle_background_clr ?>;
  }

  <?php if ($app["user"]["id"]) : ?>.hide_case_logged_in {
    display: none;
  }

  <?php endif ?>
</style>