<?php //route[/zresetuj-haslo]

$user_id = Request::urlParam(1);
$authentication_token = Request::urlParam(2);

if (Request::getSingleUsageSessionVar("just_logged_in") || !$user_id || !$authentication_token) {
    Request::redirect("/");
}

if (User::getCurrent()->isLoggedIn()) {
    User::getCurrent()->logout();
    Request::reload();
}

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

<?php include "bundles/global/templates/default.php"; ?>