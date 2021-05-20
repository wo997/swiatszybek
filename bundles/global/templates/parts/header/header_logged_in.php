<?php
$display_user = User::getCurrent()->getDisplayName();
$user_type = User::getCurrent()->entity->getProp("type");
if ($user_type == 'google') $display_user = "<img src=\"/img/google.png\" style=\"width: 15px;vertical-align: sub;\"> $display_user";
else if ($user_type == 'facebook') $display_user = "<i class=\"fab fa-facebook-square\" style=\"font-size: 15px;color: #3b5998;\"></i> $display_user";
?>

<div class="headerbtn gray_hover">
    <a href="<?= Request::$static_urls["USER"] ?>/zamowienia" class="user_btn">
        <img class="user_icon" src="/src/img/user_icon.svg">
    </a>
    <div class="headerbtn_menu user_menu">
        <div class="username"><?= $display_user ?></div>
        <hr class="mb1">
        <?php if (User::getCurrent()->priveleges["backend_access"]) : ?>
            <a class="menu_item gray_hover semi_bold mb1" href="<?= Request::$static_urls["ADMIN"] ?>/pulpit"> <i class="fas fa-user-cog"></i> Panel administratora</a>
        <?php endif ?>
        <a class="menu_item gray_hover" href="<?= Request::$static_urls["USER"] ?>/zamowienia"> <i class="fas fa-box"></i> Moje zamówienia</a>
        <a class="menu_item gray_hover" href="<?= Request::$static_urls["USER"] ?>/dane-adresy"> <i class="fas fa-address-book"></i> Dane / Adresy</a>
        <a class="menu_item gray_hover" href="<?= Request::$static_urls["USER"] ?>/zmien-haslo"> <i class="fas fa-unlock-alt"></i> Zmień hasło </a>
        <a class="menu_item gray_hover mt1" onclick="return logout()"> <i class="fa fa-sign-out-alt"></i> Wyloguj się </a>
    </div>
</div>