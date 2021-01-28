<?php //route[zresetuj-haslo]

$user_id = urlParam(1);
$authentication_token = urlParam(2);

?>


<?php startSection("head_content"); ?>

<title>Resetowanie hasła</title>

<?php startSection("body_content"); ?>

<form onsubmit="return false" id="resetPasswordForm" data-form method="post" class="paddingable" style="margin:auto;padding-bottom:50px;max-width:350px">
    <h1 class="h1" style="text-align:center">Zresetuj hasło</h1>

    <div class="label">Hasło (min. 8 znaków)</div>
    <input type="password" name="password" class="field" data-validate="password" autocomplete="new-password">

    <div class="label">Powtórz hasło</div>
    <input type="password" name="password_rewrite" class="field" data-validate="|match:#resetPasswordForm [name='password']" autocomplete="new-password">

    <input type="hidden" name="user_id" value="<?= $user_id ?>">
    <input type="hidden" name="authentication_token" value="<?= $authentication_token ?>">
    <button class="btn primary medium" style="margin:10px 0; width: 100%" onclick="resetPassword()">
        Akceptuj zmianę hasła
        <i class="fa fa-chevron-right"></i>
    </button>
</form>

<?php include "user/page_template.php"; ?>