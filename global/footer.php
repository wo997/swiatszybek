<footer style="padding:10px;text-align:center;background:#111;color:#fff">
    <?php
    // if (isset($preview_params) && isset($preview_params["page_footer"])) {
    //     $page_footer = $preview_params["page_footer"];
    // } else {
    //     $page_footer = getSetting("theme", "general", ["page_footer"], "");
    // }
    // echo getCMSPageHTML($page_footer);
    ?>
    Stopka
</footer>

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