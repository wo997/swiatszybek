<?php
$display_user = User::getCurrent()->getDisplayName();
$user_type = User::getCurrent()->data["type"];
if ($user_type == 'google') $display_user = "<img src=\"/img/google.png\" style=\"width: 15px;vertical-align: sub;\"> $display_user";
else if ($user_type == 'facebook') $display_user = "<i class=\"fab fa-facebook-square\" style=\"font-size: 15px;color: #3b5998;\"></i> $display_user";
?>

<div class="headerbtn">
    <a href="/moje-konto" class="user_btn">
        <img class="user_icon" src="/src/img/user_icon.svg">
    </a>
    <div class="headerbtn_menu user_menu">
        <div class="username"><?= $display_user ?></div>
        <?php if (User::getCurrent()->priveleges["backend_access"]) : ?>
            <a class="admin border-bottom border-top menu_item" href="<?= Request::$static_urls["ADMIN"] ?>zamowienia"> <i class="fas fa-user-cog"></i> Panel administratora</a>
        <?php endif ?>
        <a class="menu_item" href="/moje-konto"> <i class="fas fa-box"></i> Moje zamówienia</a>
        <a class="menu_item" href="/moje-konto/dane-uzytkownika"> <i class="fas fa-address-book"></i> Dane użytkownika</a>
        <?php if (User::getCurrent() == 'regular') : ?>
            <a class="menu_item" href="/moje-konto/resetowanie-hasla"> <i class="fas fa-unlock-alt"></i> Zmiana hasła </a>
        <?php endif ?>
        <a class="menu_item border-top" onclick="return logout()"> <i class="fa fa-sign-out-alt" style="vertical-align: middle;"></i> Wyloguj się </a>
    </div>
</div>