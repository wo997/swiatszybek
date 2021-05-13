<?php

endSection();

?>

<?php startSection("body_content"); ?>

<div class="user_nav">
    <?php if (User::getCurrent()->priveleges["backend_access"]) : ?>
        <a class="menu_item gray_hover semi_bold" href="<?= Request::$static_urls["ADMIN"] ?>/pulpit"> <i class="fas fa-user-cog"></i> Panel administratora</a>
    <?php endif ?>
    <a class="gray_hover" href="<?= Request::$static_urls["USER"] ?>/zamowienia"> <i class="fas fa-box"></i> Moje zamówienia</a>
    <a class="gray_hover" href="<?= Request::$static_urls["USER"] ?>/dane-adresy"> <i class="fas fa-address-book"></i> Dane / Adresy</a>
    <a class="gray_hover" href="<?= Request::$static_urls["USER"] ?>/zmien-haslo"> <i class="fas fa-unlock-alt"></i> Zmień hasło </a>
    <a class="gray_hover" onclick="return logout()"> <i class="fa fa-sign-out-alt"></i> Wyloguj się </a>
</div>
<div class="user_page_body">
    <?= def($sections, "user_page_body", ""); ?>
</div>

<?php include "bundles/global/templates/default.php"; ?>