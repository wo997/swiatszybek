<?php

endSection();

?>

<?php startSection("body"); ?>

<?php include "global/header.php"; ?>

<div class="user_nav">
    <a class="gray_hover" href="<?= Request::$static_urls["USER"] ?>/zamowienia"> <i class="fas fa-box"></i> Moje zamówienia</a>
    <a class="gray_hover" href="<?= Request::$static_urls["USER"] ?>/dane-adresy"> <i class="fas fa-address-book"></i> Dane / Adresy</a>
    <a class="gray_hover" href="<?= Request::$static_urls["USER"] ?>/zmiana-hasla"> <i class="fas fa-unlock-alt"></i> Zmiana hasła </a>
    <a class="gray_hover" onclick="return logout()"> <i class="fa fa-sign-out-alt"></i> Wyloguj się </a>
</div>

<div class="body_content scroll_panel">
    <?= def($sections, "body_content", ""); ?>
</div>

<?php include "global/blank_page_template.php"; ?>