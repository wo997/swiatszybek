<div id="fb-root"></div>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/pl_PL/sdk.js#xfbml=1&version=v6.0&appId=2750096011694583&autoLogAppEvents=1"></script>

<header>
  <div class="header-top">
    <a href="/" class="logo-wrapper"><img src="/img/logo.png"></a>

    <div class="main-search-wrapper glue-children">
      <input type="text" class="field inline" placeholder="Czego szukasz?">
      <div class="search-results"></div>
      <button class="btn primary">
        <i class="fas fa-search"></i>
      </button>
    </div>

    <div class="basket-wrapper">
      <div class="user-wrapper">
        <?php if ($app["user"]["id"]) : ?>
          <div class="dropdown mobile-hover dropdown-user">
            <div class="dropdown-header" style="padding:8px 8px;margin-right: 5px;">
              <div style="display: inline-block;max-width: 250px;text-overflow: ellipsis;overflow: hidden;vertical-align: text-top;">
                <span class="case-desktop">Moje konto</span>
              </div>
              <i class="fa fa-user-check"></i>
            </div>
            <div class="dropdown-expand">
              <div class="username">
                <?php
                if ($app["user"]["type"] == 'google') echo '<img src="/img/google.png" style="width: 15px;vertical-align: sub;"> ';
                if ($app["user"]["type"] == 'facebook') echo '<i class="fab fa-facebook-square" style="font-size: 15px;color: #3b5998;"></i> ';
                echo $app["user"]["name"];
                ?>
              </div>
              <?php if ($app["user"]["priveleges"]["backend_access"]) : ?>
                <div style="color: #05c;background: #fafafa;">
                  <a class="menu_item" href="/admin/zamowienia"> <i class="fas fa-user-cog"></i> Panel administratora</a>
                </div>
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
          </div>
        <?php else : ?>
          <a class="menu_item" style="padding:12px;cursor:pointer" onclick="showModal('loginForm',{source:this});hideLoginFormPassword()"><span class="case-desktop">Zaloguj się </span><i class="fa fa-user"></i></a>
        <?php endif ?>
      </div>
      <div class="basket mobile-hover">
        <a href="/zakup" onclick="return !IS_MOBILE && !!+$('.basket_item_count').innerHTML">
          <div style="text-align: center;font-size: 14px;font-weight: normal;">
            <span class="case-desktop">Koszyk</span>
            <div class="basket-icon-wrapper">
              <svg class="basket-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 30" xml:space="preserve">
                <path d='M12,4C9.5,4,7.5,6,7.5,8.5v1H4.3C4,9.5,3.8,9.7,3.8,10v14.5C3.8,24.8,4,25,4.3,25h15.4c0.3,0,0.5-0.2,0.5-0.5V10 c0-0.3-0.2-0.5-0.5-0.5h-3.2v-1C16.5,6,14.5,4,12,4z M8.5,8.5C8.5,6.6,10.1,5,12,5c1.9,0,3.5,1.6,3.5,3.5v1H8.59 C8.5,9.5,8.5,8.5,8.5,8.5z M19.2,10.5V24H4.8V10.5h2.7v1.8c0,0.3,0.2,0.5,0.5,0.5c0.3,0,0.5-0.2,0.5-0.5v-1.8h7.1v1.8 c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-1.8H19.2z'></path>
              </svg>
              <div class="basket_item_count"><?= $app["user"]["basket"]["item_count"] ?></div>
            </div>
          </div>
        </a>
        <div id="basketContent">
          <?= getBasketContent() ?>
        </div>
      </div>
    </div>

    <!--<button id="show_kategorie" onclick="this.classList.toggle('dropped_kategorie')">
      <span><i class="fa fa-bars"></i></span>
      <span><i class="fa fa-times"></i></span>
    </button>-->

  </div>

  <nav class="navigation">
    <?php @include "builds/topmenu.html"; ?>
  </nav>
</header>