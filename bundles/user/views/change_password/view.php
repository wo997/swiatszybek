<?php //route[{USER}/zmien-haslo]

?>


<?php Templates::startSection("head_content"); ?>

<title>Zmień hasło</title>

<?php Templates::startSection("user_page_body"); ?>

<form id="changePasswordForm" style="margin: 0 auto 0;padding: 20px 10px 80px;width: 100%;max-width: 414px;" onsubmit="return false">
    <h1 class="h1 center">Zmień hasło</h1>

    <div class="label">
        Obecne hasło
        <button class="btn small transparent toggle_password" style="margin-left:0" data-tooltip="Pokaż hasło" data-tooltip_position="right">
            <i class="fas fa-eye"></i>
        </button>
    </div>
    <input type="password" class="field current_password pretty_errors pretty_errors_inline" autocomplete="current-password">

    <?php include "bundles/global/traits/password.php"; ?>

    <input type="hidden" class="user_id" value="<?= $user_id ?>">
    <input type="hidden" class="authentication_token" value="<?= $authentication_token ?>">
    <button class="btn primary submit_btn" style="margin:10px 0; width: 100%">
        Akceptuj zmianę hasła
        <i class="fa fa-chevron-right"></i>
    </button>
</form>

<?php include "bundles/user/templates/default.php"; ?>