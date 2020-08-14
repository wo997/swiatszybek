<div id="fb-root"></div>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/pl_PL/sdk.js#xfbml=1&version=v6.0&appId=2750096011694583&autoLogAppEvents=1"></script>

<?php
include "basketContent.php";
?>

<div class="header-wrapper">
  <div class="header-inner centerwhenbig">
    <a href="/" class="logo-wrapper"><img src="/img/logo.png?a" id="logo"></a>

    <button id="show_kategorie" onclick="this.classList.toggle('dropped_kategorie')"><span>
        <!--Menu --><i class="fa fa-bars"></i></span><span>
        <!--Menu --><i class="fa fa-times"></i></span></button>
    <nav class="centerwhenbig">
      <?php @include "builds/topmenu.html"; ?>
    </nav>

    <div class="basket-wrapper">
      <?php if (true) : //!in_array($pageName,["logowanie"])) : 
      ?>
        <div style="text-align:center; font-size: 14px;margin:auto;">
          <?php if ($app["user"]["id"]) : ?>
            <div class="dropdown mobile-hover dropdown-user">
              <!--<a href="/moje-konto"><div style="display: inline-block;max-width: 250px;text-overflow: ellipsis;overflow: hidden;vertical-align: text-top;"><?= "" //htmlspecialchars($_SESSION["email"])
                                                                                                                                                                ?></div> <i class="fa fa-user"></i></a>-->
              <div class="dropdown-header" style="padding:8px 8px;margin-right: 5px;">
                <div style="display: inline-block;max-width: 250px;text-overflow: ellipsis;overflow: hidden;vertical-align: text-top;"><?= '' //htmlspecialchars($_SESSION["email"]) 
                                                                                                                                        ?><span class="case-desktop">Moje konto</span></div> <i class="fa fa-user-check"></i>
              </div>
              <div class="dropdown-expand">
                <div class="username">
                  <?php
                  if ($app["user"]["type"] == 'g') echo '<img src="/img/google.png" style="width: 15px;vertical-align: sub;"> ';
                  if ($app["user"]["type"] == 'f') echo '<i class="fab fa-facebook-square" style="font-size: 15px;color: #3b5998;"></i> ';
                  echo $app["user"]["name"];
                  ?>
                </div>
                <?php if ($app["user"]["is_admin"]) : ?>
                  <div style="color: #05c;background: #fafafa;">
                    <a class="menu_item" href="/admin/zamowienia"> <i class="fas fa-user-cog"></i> Panel administratora</a>
                    <?php
                    foreach ($admin_navigations as $page) {
                      if (isset($page['quick_menu'])) {
                        echo '<a class="menu_item" href="/' . $page['url'] . '">' . $page['title'] . ' ' . renderNotification($page['notifcation_count']) . '</a>';
                      }
                    }
                    ?>
                    <a class="menu_item" href="/admin/zamowienia"> <i class="fas fa-cog"></i> Więcej ...</a>
                  </div>
                  <hr style="margin:0">
                <?php endif ?>
                <a class="menu_item" href="/moje-konto"> <i class="fas fa-box"></i> Moje zamówienia</a>
                <a class="menu_item" href="/moje-konto/dane-uzytkownika"> <i class="fas fa-address-book"></i> Dane użytkownika</a>
                <?php if ($app["user"]["type"] == 's') : ?>
                  <a class="menu_item" href="/moje-konto/resetowanie-hasla"> <i class="fas fa-unlock-alt"></i> Zmiana hasła </a>
                <?php endif ?>
                <hr style="margin:0">
                <a class="menu_item" onclick="return logout()" href="/logout"> <i class="fa fa-sign-out-alt" style="vertical-align: middle;"></i> Wyloguj się </a>
              </div>
            </div>
          <?php else : ?>
            <a class="menu_item" style="padding:12px" href="/logowanie"><span class="case-desktop">Zaloguj się </span><i class="fa fa-user"></i></a>
          <?php endif ?>
        </div>
      <?php endif ?>
      <div id="basket">
        <a href="/zakup" onclick="return !!+$('#amount').innerHTML">
          <div style="text-align: center;font-size: 14px;font-weight: normal;">
            <span><span class="case-desktop">Koszyk</span></span>
            <div style="display:inline-block;position:relative">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 24 30" style="width: 40px;vertical-align: middle;position: relative;top: -2px;" xml:space="preserve">
                <path d='M12,4C9.5,4,7.5,6,7.5,8.5v1H4.3C4,9.5,3.8,9.7,3.8,10v14.5C3.8,24.8,4,25,4.3,25h15.4c0.3,0,0.5-0.2,0.5-0.5V10 c0-0.3-0.2-0.5-0.5-0.5h-3.2v-1C16.5,6,14.5,4,12,4z M8.5,8.5C8.5,6.6,10.1,5,12,5c1.9,0,3.5,1.6,3.5,3.5v1H8.59 C8.5,9.5,8.5,8.5,8.5,8.5z M19.2,10.5V24H4.8V10.5h2.7v1.8c0,0.3,0.2,0.5,0.5,0.5c0.3,0,0.5-0.2,0.5-0.5v-1.8h7.1v1.8 c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-1.8H19.2z'></path>
              </svg>
              <div id="amount" style="font-weight: bold;position: absolute;display: inline-block;left: -5px;font-size: 12px;width: 50px;text-align: center;top: 19px;"><?= $app["user"]["basket"]["item_count"] ?></div>
            </div>
          </div>
        </a>
        <div id="basketContent">
          <?= $basketContent ?>
        </div>
      </div>
    </div>
  </div>
  <nav class="centerwhenbig">

  </nav>
</div>
<div class="space-under-header"></div>