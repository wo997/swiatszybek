<?php //route[/rejestracja]

$register_email = Request::getSingleUsageSessionVar("register_email");

?>

<?php startSection("head_content"); ?>

<title>Rejestracja</title>

<script>
    const register_email = `<?= $register_email ?>`;
</script>

<?php startSection("body_content"); ?>

<div id="registerForm" style="margin: auto auto 0;padding:20px 10px 80px;width:100%;max-width:500px">
    <h1 class="h1 center">Rejestracja</h1>
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
    <input type="password" class="field password pretty_errors" data-validate="password" autocomplete="new-password">

    <div class="label">Powtórz hasło</div>
    <input type="password" class="field password_rewrite pretty_errors" data-validate="match:#registerForm .password" autocomplete="new-password">

    <button class="btn primary medium fill space_top submit_btn">
        Dalej
        <i class="fa fa-chevron-right"></i>
    </button>
</div>

<?php include "bundles/global/templates/default.php"; ?>