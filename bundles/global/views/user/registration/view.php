<?php //route[/rejestracja]

$register_email = Request::getSingleUsageSessionVar("register_email");

?>

<?php startSection("head_content"); ?>

<title>Rejestracja</title>

<script>
    const register_email = `<?= $register_email ?>`;
</script>

<?php startSection("body_content"); ?>

<form id="registerForm" style="margin: auto auto 0;padding:20px 10px 80px;width:100%;max-width:500px" onsubmit="return false;">
    <h1 class="h1 center" style="margin-bottom:10px;">Rejestracja</h1>
    <div class="center">
        <span class="link" onclick="showModal('loginForm',{source:this});">Zaloguj się</span>
        <span class="link" style="pointer-events:none">/</span>
        <a class="link" href="/resetowanie-hasla">Zresetuj hasło</a>
    </div>
    <span class="label">E-mail</span>
    <input class="field email pretty_errors" autocomplete="email" data-validate="custom:validateUserEmailExists">

    <!-- <span class="label">Login <span class="optional_label"></span></span>
    <input class="field login" autocomplete="nickname" data-validate="optional|length:{5,}">-->

    <div class="label">
        <span>Hasło</span>
        <button class="btn small transparent toggle_password" style="margin-left:0" data-tooltip="Pokaż hasło" data-tooltip_position="right">
            <i class="fas fa-eye"></i>
        </button>
    </div>
    <input type="password" class="field password pretty_errors pretty_errors_inline" data-validate="password" autocomplete="new-password">
    <div class="user_tip password_requirements" style="margin-top:10px;">
        <p class="eigth_characters"> 8 znaków długości</p>
        <p class="one_small_letter"> 1 mała litera (a-z)</p>
        <p class="one_big_letter"> 1 wielka litera (A-Z)</p>
        <p class="one_digit"> 1 cyfra (0-9)</p>
    </div>

    <div class="label">Powtórz hasło</div>
    <input type="password" class="field password_rewrite pretty_errors" data-validate="match:#registerForm .password" autocomplete="new-password">

    <button class="btn primary medium fill space_top submit_btn">
        Dalej
        <i class="fa fa-chevron-right"></i>
    </button>
</form>

<?php include "bundles/global/templates/default.php"; ?>