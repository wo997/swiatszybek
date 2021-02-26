<footer>
    <?php
    if (isset($preview_params) && isset($preview_params["page_footer"])) {
        $page_footer = $preview_params["page_footer"];
    } else {
        $page_footer = getSetting("theme", "general", ["page_footer"], "");
    }
    echo getCMSPageHTML($page_footer);
    ?>
</footer>
<!--<footer style="line-height:1.5">
  <div class="mobileRow" style="justify-content: space-evenly;">
    © Świat Szybek. Wszelkie prawa zastrzeżone. Polityka Prywatności.
  </div>
</footer>-->
<form action="/google/login" method="post" style="display:none" id="google-form">
    <input type="text" name="id_token">
</form>

<div class="g-signin2" data-onsuccess="onSignIn" style="display:none"></div>
<div id="fb-root"></div>

<div class="offline"><i class="fas fa-exclamation-circle"></i> Brak połączenia z internetem!</div>
<?php if (DEBUG_MODE) : ?>
    <div data-tooltip="Całkowity czas generowania po stronie serwera" style="position:fixed;font-weight:600;right:5px;bottom:5px;background:#eee;color:#444;padding:7px 10px;border-radius:5px;box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.24);z-index:100">
        <i class="far fa-clock"></i> <?= round(1000 * (microtime(true) - time)); ?>ms
    </div>
<?php endif ?>

<?php

if (isset($CSS_files)) {
    foreach ($CSS_files as $file) {
        echo "<link rel='stylesheet' href='$file?v=" . CSS_RELEASE . "'>";
    }
}
if (isset($JS_files)) {
    foreach ($JS_files as $file) {
        echo "<script src='$file?v=" . JS_RELEASE . "'></script>";
    }
}

?>

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.12.0/css/all.css">
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">

<link href="/src/quill.snow.css?v=<?= RELEASE ?>" rel="stylesheet">

<div id="variantAdded" class="variantAdded" data-form data-modal data-dismissable>
    <div class="modal_body">
        <button class="close_modal_btn"><i class="fas fa-times"></i></button>

        <h3 class="modal_header">Dodano do koszyka</h3>

        <div style="display:flex;padding: min(2vw,15px);align-items: center;" class="mobileRow">
            <img class="variant_image" data-height="1w">
            <div style="width: 55%;max-width: 300px;">
                <div style="font-size: 14px;display: flex;align-items: center;min-height: 80px;">
                    <div>
                        <span class="variant_name" style="font-size:1.15em"></span>
                        <div>
                            <span class="variant_qty" style="font-size: 1.1em;word-spacing: -0.1em;"></span>
                            <span style="margin: 3px">x</span>
                            <span class="variant_price pln" style="font-size: 1.3em;"></span>
                        </div>
                    </div>
                </div>
                <div class="btn primary medium fill" style="margin: 10px 0" onclick="hideParentModal(this)">
                    Kontynuuj zakupy
                </div>
                <a href="/zakup" class="btn primary medium fill" style="margin-bottom: 6px">
                    Kup teraz
                </a>
            </div>
        </div>
    </div>
</div>