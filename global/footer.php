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

<div id="loginForm" data-form data-modal data-dismissable>
  <div class="modal-body">
    <button class="fas fa-times close-modal-btn"></button>

    <h3 class="header">Logowanie</h3>

    <div class="scroll-panel scroll-shadow">
      <div class="field-title">E-mail</div>
      <input class="field" type="text" autocomplete="username" name="email" data-validate="backend|custom:validateLoginUserEmail|delay:300">

      <div class="field-title">
        <span>Hasło</span>
        <i class="fas fa-eye btn" onclick="togglePasswordFieldType(this,$(this).parent().next())" data-tooltip="Pokaż hasło" data-position="right"></i>
      </div>
      <input class="field" type="password" autocomplete="current-password" name="password" data-validate="backend|blank_on_change:true">

      <div style="margin-top:10px;text-align:center">
        <label class="checkbox-wrapper">
          <input type="checkbox" name="remember_me" value="1">
          <div class="checkbox"></div>
          Zapamiętaj mnie
        </label>
      </div>

      <button class="btn primary big" style="margin:10px 0; width: 100%" onclick="login()" data-submit>
        Zaloguj się
        <i class="fa fa-chevron-right"></i>
      </button>

      <div style="text-align: center; padding: 10px 0">
        <a href="/rejestracja" class="btn buff subtle" style="font-weight: 600;">
          Zarejestruj się <i class="fa fa-user-plus"></i>
        </a>
        <div style="height: 10px;"></div>
        <a href="/resetowanie-hasla" class="btn buff subtle" style="font-weight: 600;">
          Zresetuj hasło <i class="fa fa-lock-open"></i>
        </a>
      </div>

      <div style="text-align: center;">lub</div>
      <div class="g-signin2" data-onsuccess="onSignIn"></div>

      <?= $fb_login_btn ?>
    </div>
  </div>
</div>

<div id="message-modal" data-modal data-dismissable>
  <div>
    <div class="modal-message">
    </div>
    <div>
      <span class="link details-btn" style="display: none; width: 100px; margin-left: 10px;">Co dalej?</span>
    </div>
  </div>
</div>

<?php

if (isset($CSS_files)) {
  foreach ($CSS_files as $file) {
    echo "<link rel='stylesheet' href='$file?v=" . RELEASE . "'>";
  }
}
if (isset($JS_files)) {
  foreach ($JS_files as $file) {
    echo "<script src='$file?v=" . RELEASE . "'></script>";
  }
}

?>