<div class="tooltip" style="display:none"></div>

<div id="modal-wrapper">
  <div class="modal-content"></div>
</div>

<footer style="line-height:1.5">
  <div class="mobileRow" style="justify-content: space-evenly;">
    © Świat Szybek. Wszelkie prawa zastrzeżone. Polityka Prywatności.
  </div>
</footer>
<form action="/google/login" method="post" style="display:none" id="google-form">
  <input type="text" name="id_token">
</form>

<div class="g-signin2" data-onsuccess="onSignIn" style="display:none"></div>

<div class="offline"><i class="fas fa-exclamation-circle"></i> Brak połączenia z internetem!</div>
<?php if (config("debug_mode", false)) : ?>
  <div data-tooltip="Całkowity czas generowania po stronie serwera" style="position:fixed;font-weight:600;right:5px;bottom:5px;background:#eee;color:#444;padding:7px 10px;border-radius:5px;-webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.24);-moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.24);box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.24);z-index:100">
    <i class="far fa-clock"></i> <?= round(1000 * (microtime(true) - time)); ?>ms
  </div>
<?php endif ?>

<div id="loginForm" data-form data-modal>
  <div class="modal-body">
    <h1 class="h1">Logowanie</h1>

    <div class="field-title">E-mail</div>
    <input class="field" type="text" autocomplete="username" name="email" data-validate="email">

    <div class="field-title">Hasło</div>
    <input class="field" type="password" autocomplete="password" name="password" data-validate="password">

    <div style="margin-top:10px;text-align:center">
      <label class="checkbox-wrapper">
        <input type="checkbox" name="remember_me" value="1">
        <div class="checkbox"></div>
        Zapamiętaj mnie
      </label>
    </div>

    <button class="btn primary big" style="margin:10px 0; width: 100%" onclick="login()">
      Zaloguj się
      <i class="fa fa-chevron-right"></i>
    </button>

    <div style="text-align: center; padding: 10px 0">
      <a href="/rejestracja" class="btn buff subtle">
        Zarejestruj się <i class="fa fa-user-plus"></i>
      </a>
      <div style="height: 10px;"></div>
      <a href="/resetowanie-hasla" class="btn buff subtle">
        Zresetuj hasło <i class="fa fa-lock-open"></i>
      </a>
    </div>

    <div style="text-align: center;">lub</div>
    <div class="g-signin2" data-onsuccess="onSignIn"></div>

    <?= $fb_login_btn ?>
  </div>
</div>