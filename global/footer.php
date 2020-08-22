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
  <div data-tooltip="Całkowity czas generowania po stronie serwera" style="position:fixed;font-weight:600;right:5px;bottom:5px;background:#eee;color:#444;padding:7px 10px;border-radius:5px;-webkit-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.24);-moz-box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.24);box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.24);">
    <i class="far fa-clock"></i> <?= round(1000 * (microtime(true) - time)); ?>ms
  </div>
<?php endif ?>