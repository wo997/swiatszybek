<?php //route[/resetowanie-hasla]
?>


<?php startSection("head_content"); ?>

<title>Resetowanie hasła</title>

<?php startSection("body_content"); ?>

<form onsubmit="return false" id="resetPasswordForm" style="margin: auto auto 0;padding: 20px 10px 80px;width: 100%;max-width: 414px;">
    <h1 class="h1 center" style="margin-bottom:10px;">Resetowanie hasła</h1>
    <div class="center">
        <span class="link" onclick="showModal('loginForm',{source:this});">Zaloguj się</span>
        <span class="link" style="pointer-events:none">/</span>
        <a class="link" href="/rejestracja">Rejestracja konta</a>
    </div>

    <p style="margin-top: 20px;"> Podaj adres e-mail konta do którego utraciłaś/eś hasło, a my wyślemy link do jego zresetowania. </p>

    <div class="label">Twój e-mail</div>
    <input type="text" class="field" name="email" data-validate="email">

    <button class="btn primary medium" style="margin:10px 0; width: 100%" onclick="resetPassword()">
        Dalej
        <i class="fa fa-chevron-right"></i>
    </button>
</form>

<?php include "bundles/global/templates/default.php"; ?>