<?php //route[resetowanie-hasla]
?>


<?php startSection("head_content"); ?>

<title>Resetowanie hasła</title>

<?php startSection("body_content"); ?>

<form onsubmit="return false" id="resetPasswordForm" data-form method="post" class="paddingable" style="margin:auto;padding-bottom:50px;max-width:350px">
    <h1 class="h1" style="text-align:center">Resetowanie hasła</h1>

    <div class="label">Twój e-mail</div>
    <input type="text" class="field" name="email" data-validate="email">

    <button class="btn primary medium" style="margin:10px 0; width: 100%" onclick="resetPassword()">
        Wyślij link na maila
        <i class="fa fa-envelope"></i>
    </button>
</form>

<?php include "user/page_template.php"; ?>