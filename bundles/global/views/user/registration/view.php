<?php //route[/rejestracja]

$register_email = Request::getSingleUsageSessionVar("register_email");

if (Request::getSingleUsageSessionVar("just_logged_in")) {
    Request::redirect("/");
}

?>

<?php Templates::startSection("head"); ?>

<title>Rejestracja</title>

<script>
    const register_email = `<?= $register_email ?>`;
</script>

<?php Templates::startSection("body_content"); ?>

<form id="registerForm" style="margin: auto auto 0;padding:20px 10px 80px;width:100%;max-width:500px" onsubmit="return false;">
    <h1 class="h1 center mb2">Rejestracja</h1>
    <div class="center">
        <span class="link" onclick="showModal('loginForm',{source:this});">Zaloguj się</span>
        <span class="link" style="pointer-events:none">/</span>
        <a class="link" href="/resetowanie-hasla">Zresetuj hasło</a>
    </div>
    <span class="label">E-mail</span>
    <input class="field email pretty_errors" autocomplete="email" data-validate="custom:validateUserEmailExists">

    <!-- <span class="label">Login <span class="optional_label"></span></span>
    <input class="field login" autocomplete="nickname" data-validate="optional|length:{5,}">-->

    <?php include "bundles/global/traits/password.php"; ?>

    <button class="btn primary medium fill mtf submit_btn">
        Dalej
        <i class="fa fa-chevron-right"></i>
    </button>
</form>

<?php include "bundles/global/templates/default.php"; ?>