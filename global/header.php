<header>
  <div class="header-top">
    <a href="/" class="logo-wrapper"><img src="/img/logo.png"></a>

    <div class="main-search-wrapper case-desktop">
      <label for="main_search" class="glue-children">
        <input type="text" id="main_search" class="field inline" placeholder="Czego szukasz?">
        <button class="btn primary" onclick="btnSearchProducts()">
          <img class="search-icon" src="/src/img/search_icon.svg">
        </button>
      </label>
      <div class="search-results"></div>
    </div>

    <div class="nav-wrapper">
      <div class="mobile-main-search-wrapper case-mobile headerbtn">
        <div onclick='showModal("mainSearch", {source:this});setTimeout(()=>{$(".main-search-wrapper label").click()},200)'>
          <img class="search-icon" src="/src/img/search_icon.svg">
        </div>
      </div>
      <div class="user-wrapper headerbtn">
        <?php if ($app["user"]["id"]) : ?>
          <a href="/moje-konto">
            <!--<div class="my-acc-text">
              <span class="case-desktop">Moje konto</span>
            </div>-->
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
              <a class="admin border-bottom border-top menu_item" href="/admin/zamowienia"> <i class="fas fa-user-cog"></i> Panel administratora</a>
            <?php endif ?>
            <a class="menu_item" href="/moje-konto"> <i class="fas fa-box"></i> Moje zamówienia</a>
            <a class="menu_item" href="/moje-konto/dane-uzytkownika"> <i class="fas fa-address-book"></i> Dane użytkownika</a>
            <?php if ($app["user"]["type"] == 'regular') : ?>
              <a class="menu_item" href="/moje-konto/resetowanie-hasla"> <i class="fas fa-unlock-alt"></i> Zmiana hasła </a>
            <?php endif ?>
            <a class="menu_item border-top" onclick="return logout()"> <i class="fa fa-sign-out-alt" style="vertical-align: middle;"></i> Wyloguj się </a>
          </div>
        <?php else : ?>
          <a onclick="showModal('loginForm',{source:this});">
            <span class="case-desktop">Zaloguj się </span>
            <img class="user-icon" src="/src/img/user_icon.svg">
          </a>
        <?php endif ?>
      </div>
      <div class="headerbtn">
        <img class="heart-icon" src="/src/img/heart_icon.svg?a=2">
      </div>
      <div class="headerbtn">
        <img class="product-history-icon" src="/src/img/product_history_icon.svg">
      </div>
      <div class="basket-wrapper headerbtn">
        <div class="basket-btn">
          <!--<span class="case-desktop">Koszyk</span>-->
          <div class="basket-icon-wrapper">
            <img class="basket-icon" src="/src/img/basket_icon.svg">
            <div class="basket_item_count"></div>
          </div>
        </div>
        <div class="nav_basket_container">
          <div class='scroll-panel scroll-shadow scroll-padding header_basket_content_wrapper'>
            <div class='case_basket_empty expand_y'>
              <h3 style='text-align:center;margin:2em 0'>Koszyk jest pusty!</h3>
            </div>
            <div class='case_basket_not_empty'>
              <h3 style='text-align:center;margin:0.3em 0;font-weight:600'>Koszyk</h3>
              <hr style="margin:0">
            </div>
            <div class='header_basket_content'></div>
          </div>
          <hr style='margin:0'>
          <div class='nav_basket_summary'>
            <div style='text-align:center;padding:5px;font-size:1.1em'>
              Wartość koszyka:
              <span class="total_basket_cost pln"></span>
            </div>
            <button class="btn primary medium fill gotobuy" onclick="window.location='/zakup';">
              Przejdź do kasy
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class='case-mobile headerbtn' onclick='showModal("mainMenu", {source:this})'>
        <img class="menu-icon" src="/src/img/menu_icon.svg">
      </div>
    </div>
  </div>

  <nav class="navigation">
    <?php @include "builds/topmenu.html"; ?>
  </nav>
</header>

<div class="header-height"></div>