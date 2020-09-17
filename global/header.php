<div id="fb-root"></div>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/pl_PL/sdk.js#xfbml=1&version=v6.0&appId=2750096011694583&autoLogAppEvents=1"></script>

<header>
  <div class="header-top">
    <a href="/" class="logo-wrapper"><img src="/img/logo.png"></a>

    <div class="main-search-wrapper glue-children case-desktop">
      <input type="text" class="field inline" placeholder="Czego szukasz?">
      <div class="search-results"></div>
      <button class="btn primary">
        <img class="search-icon" src="/src/img/search_icon.svg">
      </button>
    </div>

    <div class="nav-wrapper">
      <div class="mobile-main-search-wrapper case-mobile">
        <button class="btn transparent">
          <img class="search-icon" src="/src/img/search_icon.svg">
        </button>
      </div>
      <div class="user-wrapper">
        <?php if ($app["user"]["id"]) : ?>
          <a href="/moje-konto" style="padding:8px 8px;margin-right: 5px;">
            <div href="/moje-konto" style="display: inline-block;max-width: 250px;text-overflow: ellipsis;overflow: hidden;vertical-align: text-top;">
              <span class="case-desktop">Moje konto</span>
            </div>
            <img class="user-icon" src="/src/img/user_icon.svg">
          </a>
          <div class="user-menu">
            <div class="username">
              <?php
              if ($app["user"]["type"] == 'google') echo '<img src="/img/google.png" style="width: 15px;vertical-align: sub;"> ';
              if ($app["user"]["type"] == 'facebook') echo '<i class="fab fa-facebook-square" style="font-size: 15px;color: #3b5998;"></i> ';
              echo $app["user"]["name"];
              ?>
            </div>
            <?php if ($app["user"]["priveleges"]["backend_access"]) : ?>
              <a class="menu_item admin" href="/admin/zamowienia"> <i class="fas fa-user-cog"></i> Panel administratora</a>
              <hr style="margin:0">
            <?php endif ?>
            <a class="menu_item" href="/moje-konto"> <i class="fas fa-box"></i> Moje zamówienia</a>
            <a class="menu_item" href="/moje-konto/dane-uzytkownika"> <i class="fas fa-address-book"></i> Dane użytkownika</a>
            <?php if ($app["user"]["type"] == 'regular') : ?>
              <a class="menu_item" href="/moje-konto/resetowanie-hasla"> <i class="fas fa-unlock-alt"></i> Zmiana hasła </a>
            <?php endif ?>
            <hr style="margin:0">
            <a class="menu_item" onclick="return logout()"> <i class="fa fa-sign-out-alt" style="vertical-align: middle;"></i> Wyloguj się </a>
          </div>
        <?php else : ?>
          <a class="menu_item" style="padding:12px;cursor:pointer" onclick="showModal('loginForm',{source:this});hideLoginFormPassword()">
            <span class="case-desktop">Zaloguj się </span>
            <img class="user-icon" src="/src/img/user_icon.svg">
          </a>
        <?php endif ?>
      </div>
      <div class="basket">
        <a href="/zakup" onclick="return !IS_MOBILE && !!+$('.basket_item_count').innerHTML">
          <div style="text-align: center;font-size: 14px;font-weight: normal;">
            <span class="case-desktop">Koszyk</span>
            <div class="basket-icon-wrapper">
              <img class="basket-icon" src="/src/img/basket_icon.svg">
              <div class="basket_item_count"><?= $app["user"]["basket"]["item_count"] ?></div>
            </div>
          </div>
        </a>
        <div class="nav_basket_content">
          <?= getBasketContent() ?>
        </div>
      </div>
    </div>
  </div>

  <nav class="navigation">
    <?php @include "builds/topmenu.html"; ?>
  </nav>
</header>

<div class="header-height"></div>