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

$user_email = DB::fetchVal("SELECT email FROM user WHERE user_id = ?", [$user_id]);
if (!$user_email) {
    Request::redirect("/");
}

?>


<?php Templates::startSection("head"); ?>

<title>Resetowanie hasła</title>

<?php Templates::startSection("body_content"); ?>

<form id="resetPasswordForm" style="margin: auto auto 0;padding: 20px 10px 80px;width: 100%;max-width: 414px;" onsubmit="return false">
    <h1 class="h1" style="text-align:center">Zresetuj hasło</h1>

    <div class="label">Email</div>
    <div><?= $user_email  ?></div>

    <?php include "bundles/global/traits/password.php"; ?>

    <input type="hidden" class="user_id" value="<?= $user_id ?>">
    <input type="hidden" class="authentication_token" value="<?= $authentication_token ?>">
    <button class="btn primary submit_btn" style="margin:10px 0; width: 100%">
        Akceptuj zmianę hasła
        <i class="fa fa-chevron-right"></i>
    </button>
</form>

<?php include "bundles/global/templates/default.php"; ?>