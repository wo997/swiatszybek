<div class="tooltip" style="display:none"></div>

<div id="modal-wrapper">
  <div class="modal-content"></div>
</div>

<footer style="line-height:1.5">
  <div class="mobileRow" style="justify-content: space-evenly;">
    
    <div>
        <b style="margin-bottom:6px;display:inline-block">Moje konto</b><br>
        <?php if ($app["user"]["id"]) : ?>
          <a href="/moje-konto">Zamówienia</a><br>
          <a href="/moje-konto/dane-uzytkownika">Dane użytkownika</a><br>
          <?php if ($app["user"]["type"] == 's') : ?>
          <a href="/moje-konto/resetowanie-hasla">Zmiana hasła</a><br>
          <?php endif ?>
          <a onclick="return logout()" href="/logout">Wyloguj się</a>
        <?php else : ?>
          <a href="/logowanie">Zaloguj się</a>
        <?php endif ?>
                  
    </div>

    <div>
      <b style="margin-bottom:6px;display:inline-block">Informacje</b><br>
      <a href="/o-padmate">O <?=config('main_email_sender')?></a><br>
      <a href="/wysylka-i-dostawa">Wysyłka i dostawa</a><br>
      <a href="/odstapienie-od-umowy">Odstąpienie od umowy</a><br>
      <a href="/regulamin">Regulamin</a><br>
      <a href="/polityka-prywatnosci">Polityka Prywatności</a><br>
    </div>

    <div>
      <b style="margin-bottom:6px;display:inline-block">Kontakt</b><br>
      <a href="mailto:<?= config('main_email'); ?>"><?= config('main_email'); ?> <i class="fa fa-envelope" style="margin-left:3px;"></i></a><br>
      <a href="tel:<?= config('main_phone'); ?>"><?= config('main_phone'); ?> <i class="fa fa-phone" style="margin-left:3px;"></i></a><br>

      <?= config('company_name'); ?><br>
      <?= config('company_street_name'); ?> <?= config('company_street_number'); ?><br>
      <?= config('company_postal_code'); ?> <?= config('company_city'); ?><br><br>

      Oficjalny dystrybutor produktów firmy <?=config('main_email_sender')?> w Polsce:<br>
      <a href="https://www.solectric.sklep.pl/">www.solectric.sklep.pl</a>

    </div>

  </div>

  
  <div class="social-icons" style="text-align:center;margin-top:30px">

    <?php if (strlen($url)<2) : ?>
      <!--<h1 class="h1" style="display: inline-block;font-size: 16px;font-weight: normal;margin: 0;margin-right: 5px;transform: translateY(-2px);">Słuchawki Pamu</h1>-->
    <?php else : ?>
      <!--<h2 style="display: inline-block;font-size: 16px;font-weight: normal;margin: 0;margin-right: 5px;transform: translateY(-2px);">Słuchawki Pamu</h2>-->
    <?php endif ?>
  
    <a target="_blank" href="https://twitter.com/PadmateAudio"><i class="fab fa-twitter"></i></a>
    <a target="_blank" href="https://www.facebook.com/PadmateTech/"><i class="fab fa-facebook-f"></i></a>
    <a target="_blank" href="https://www.instagram.com/padmate/"><i class="fab fa-instagram"></i></a>
    <a target="_blank" href="https://www.youtube.com/channel/UCJS5-h24hD-wH9qjZ9VhFyw"><i class="fab fa-youtube"></i></a>
  </div>
  
</footer>
<form action="/google/login" method="post" style="display:none" id="google-form">
  <input type="text" name="id_token">
</form>

<div class="g-signin2" data-onsuccess="onSignIn" style="display:none"></div>